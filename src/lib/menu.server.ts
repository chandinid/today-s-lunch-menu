import { extractTextItems, getDocumentProxy, type StructuredTextItem } from "unpdf";
import { getStore } from "@netlify/blobs";
import { getAllergenIndex, matchAllergens, matchVegetarian } from "./allergens.server";
import { callClaudeForJson } from "./claude.server";

export const MENUS_PAGE_URL =
  "https://www.sfusd.edu/services/health-wellness/nutrition-school-meals/menus";

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export type MenuDay = {
  day: number;
  breakfast: string | null;
  lunch: string | null;
  snack: string | null;
  breakfastAllergens: string[] | null;
  lunchAllergens: string[] | null;
  snackAllergens: string[] | null;
  /**
   * Whether the day's main lunch item (before any "Upon Request:" alternative) is vegetarian,
   * per the K-12 lunch allergen sheet's "Veg" marker. null when there's no confident match —
   * the "Upon Request" alternative itself is always the vegetarian option (SFUSD marks it that
   * way by definition), so it doesn't need this flag; the UI treats it as vegetarian directly.
   */
  lunchVegetarian: boolean | null;
};

export type MonthMenu = {
  month: string;
  year: number;
  sourceUrl: string;
  pdfUrl: string;
  days: MenuDay[];
};

// Bump this whenever getMonthMenu's parsing/shape changes enough that previously-cached entries
// should be considered stale — that invalidates every cached month on the next deploy without
// needing a one-off debug route to manually clear Netlify Blobs each time.
const CACHE_SCHEMA_VERSION = 2;

type CacheEntry = { value: MonthMenu; expires: number; schemaVersion: number };
// A plain in-memory Map only lives as long as one serverless function instance — on Netlify that
// instance is thrown away on every cold start (which happens often for a low-traffic site, and
// on every new deploy), so relying on it alone meant most visits re-downloaded the PDF and re-ran
// the AI parse from scratch, which is slow enough to read as "no data" while it's in flight. It's
// kept here only as a same-instance fast path; Netlify Blobs (below) is the real persistent cache
// shared across every instance and across cold starts.
const cache = new Map<string, CacheEntry>();
const TTL_MS = 1000 * 60 * 60 * 6;

/** Once a month has fully ended, its menu is frozen — see getMonthMenu. */
function isPastMonth(month: string, year: number, now: Date): boolean {
  const idx = MONTHS.indexOf(month as (typeof MONTHS)[number]);
  if (idx === -1) return false;
  if (year !== now.getFullYear()) return year < now.getFullYear();
  return idx < now.getMonth();
}

/** Whether a cached entry can be served as-is. A past month is frozen: once we have anything for
 * it, that's permanent — there's no live source left to re-check against (SFUSD only keeps one
 * standing PDF link for whichever month is current), so schema/TTL staleness doesn't matter, it's
 * this or nothing. The current/future months still need both a matching schema and a live TTL. */
function isCacheEntryUsable(entry: CacheEntry, past: boolean): boolean {
  if (past) return true;
  return entry.schemaVersion === CACHE_SCHEMA_VERSION && entry.expires > Date.now();
}

/** Netlify Blobs auto-configures itself from the deploy's runtime context, which is only present
 * when this actually runs as a deployed Netlify Function — not in local dev. Fall back to
 * memory-only caching there instead of failing. */
function blobStore() {
  try {
    return getStore({ name: "menu-cache", consistency: "strong" });
  } catch {
    return null;
  }
}

async function readPersistedCache(key: string): Promise<CacheEntry | null> {
  const store = blobStore();
  if (!store) return null;
  try {
    return await store.get(key, { type: "json" });
  } catch (error) {
    console.error("Netlify Blobs read failed", error);
    return null;
  }
}

async function writePersistedCache(key: string, entry: CacheEntry): Promise<void> {
  const store = blobStore();
  if (!store) return;
  try {
    await store.setJSON(key, entry);
  } catch (error) {
    console.error("Netlify Blobs write failed", error);
  }
}

/** Scrape the SFUSD menus page for the Pre-K Breakfast/Lunch/Snack Drive file for a given month.
 * SFUSD's page layout has changed shape twice now: originally a fresh "LunchMaster PreK" file
 * per month under a "{Month} Menus" heading; then, after switching vendors to Revolution Foods,
 * a single standing "Pre-K Breakfast, Lunch, and Snack" link they updated in place (so there was
 * just one file, and it alone could swap to the next month's content ahead of the calendar —
 * see the month-mismatch guard in getMonthMenu, kept as a safety net below). As of October 2026
 * they publish one Drive link per currently-available month again, all on the same line: a
 * "Pre-K Breakfast, Lunch, and Snack" label (in a <strong>, not inside any <a>) followed by a
 * "September | October" pair of links whose own visible text is just the month name. Find that
 * label's paragraph first, then the specific month's link inside it, rather than matching "Pre-K"
 * against an anchor's own text (there usually isn't one anymore). */
export async function findPreKMenuFileId(month: string): Promise<string | null> {
  const res = await fetch(MENUS_PAGE_URL, {
    headers: { "user-agent": "Mozilla/5.0 (compatible; SchoolMenuBot/1.0)" },
  });
  if (!res.ok) throw new Error(`Could not load the SFUSD menus page (${res.status})`);
  const html = await res.text();

  const paragraphRe =
    /<p>(?:(?!<\/p>)[\s\S])*?Pre-K Breakfast,\s*Lunch,?\s*and\s*Snack(?:(?!<\/p>)[\s\S])*?<\/p>/i;
  const block = paragraphRe.exec(html)?.[0];
  if (!block) return null;

  const linkRe =
    /<a[^>]+href="https:\/\/drive\.google\.com\/file\/d\/([^/"]+)[^"]*"[^>]*>([\s\S]{0,100}?)<\/a>/g;
  let m: RegExpExecArray | null;
  while ((m = linkRe.exec(block))) {
    const text = (m[2] ?? "").replace(/<[^>]*>/g, "").trim();
    if (new RegExp(`^${month}`, "i").test(text)) {
      return m[1] as string;
    }
  }
  return null;
}

const Y_TOLERANCE = 3;

/** One reading-order row of text items, all sharing roughly the same y (PDF coordinate space —
 * higher y is higher on the page). */
type PageRow = { y: number; items: StructuredTextItem[] };

function groupRows(items: StructuredTextItem[]): PageRow[] {
  const rows: PageRow[] = [];
  for (const it of items) {
    if (!it.str.trim()) continue;
    const row = rows.find((r) => Math.abs(r.y - it.y) <= Y_TOLERANCE);
    if (row) row.items.push(it);
    else rows.push({ y: it.y, items: [it] });
  }
  for (const row of rows) row.items.sort((a, b) => a.x - b.x);
  rows.sort((a, b) => b.y - a.y); // top of page first
  return rows;
}

type DayColumn = { x: number; day: number };

/** A "day header" row is a Monday-Friday row of bare day-of-month numbers (e.g. "7  8  9  10
 * 11"), strictly increasing left to right — the one reliable anchor for which x-position belongs
 * to which day in the row-block below it. Returns null for any row that isn't one. */
function dayHeaderColumns(row: PageRow): DayColumn[] | null {
  const cells = row.items
    .map((it) => it.str.trim())
    .map((str, idx) => ({ str, x: row.items[idx]!.x }))
    .filter(({ str }) => /^\d{1,2}$/.test(str))
    .map(({ str, x }) => ({ x, day: Number(str) }))
    .filter(({ day }) => day >= 1 && day <= 31);
  if (cells.length < 2) return null;
  for (let i = 1; i < cells.length; i++) {
    if (cells[i]!.day <= cells[i - 1]!.day) return null;
  }
  return cells;
}

function nearestColumn(x: number, columns: DayColumn[]): number {
  let best = columns[0]!;
  let bestDist = Math.abs(x - best.x);
  for (const c of columns) {
    const dist = Math.abs(x - c.x);
    if (dist < bestDist) {
      best = c;
      bestDist = dist;
    }
  }
  return best.day;
}

const WEEKDAY_RE = /^(Monday|Tuesday|Wednesday|Thursday|Friday)$/i;

/** Matches the start of SFUSD's standing footer/legend boilerplate that appears once, below the
 * last week's row, on every page (allergen key, "Breakfast/Lunch/Snack Includes: ...", "This
 * institution is an equal opportunity provider...", seasonal fruit call-outs, etc). There's no
 * day-header row below the last week to signal "the table has ended", so the column-bucketing
 * above happily attributes this page-wide text to whichever day column it's horizontally
 * closest to — usually the last week's days. Once a day's assembled text hits one of these
 * markers, everything from that point on is boilerplate, not menu content, so it gets cut. */
const FOOTER_MARKER_RE =
  /(Breakfast|Lunch|Snack) Includes:|equal opportunity provider|subject to change without notice|\*?All (Grain|Breakfast|Lunch|Snack) Items|Whole Grain Rich|snacks? meet \d|Fruit Rotation:|fruits meet \d|Featured (Fruit|Produce):|Vegetarian Menu Items Do Not Contain Pork|New Menu Item/i;

/** Reconstructs a "day-of-month -> cell text" map from a page's positional text items. This is
 * the fix for a real bug: unpdf's plain extractText() only returns a flat left-to-right,
 * top-to-bottom stream of text with no notion of columns, so when a mid-week cell is genuinely
 * blank (e.g. a day with no menu item yet), the text from later days in that row silently shifts
 * left and gets attributed to the wrong (earlier) day. Using each row's x-position against that
 * week's day-number header sidesteps this — a blank cell just contributes no text, instead of
 * vanishing and dragging its neighbors' text out of place. */
function reconstructPage(items: StructuredTextItem[]): {
  title: string;
  dayText: Map<number, string>;
} {
  const rows = groupRows(items);
  const dayLines = new Map<number, string[]>();
  const titleLines: string[] = [];
  let columns: DayColumn[] | null = null;

  for (const row of rows) {
    const header = dayHeaderColumns(row);
    if (header) {
      columns = header;
      for (const c of columns) if (!dayLines.has(c.day)) dayLines.set(c.day, []);
      continue;
    }
    if (!columns) {
      titleLines.push(
        row.items
          .map((it) => it.str.trim())
          .filter(Boolean)
          .join(" "),
      );
      continue;
    }

    const words = row.items.map((it) => it.str.trim()).filter(Boolean);
    if (words.length > 0 && words.every((w) => WEEKDAY_RE.test(w))) continue; // "Monday Tuesday..."

    const buckets = new Map<number, string[]>();
    for (const it of row.items) {
      const text = it.str.trim();
      if (!text) continue;
      const day = nearestColumn(it.x, columns);
      if (!buckets.has(day)) buckets.set(day, []);
      buckets.get(day)!.push(text);
    }
    for (const [day, cellWords] of buckets) {
      const text = cellWords.join(" ").replace(/\s+/g, " ").trim();
      if (!text) continue;
      if (!dayLines.has(day)) dayLines.set(day, []);
      dayLines.get(day)!.push(text);
    }
  }

  const dayText = new Map<number, string>();
  for (const [day, lines] of dayLines) {
    const joined = lines.join(" ").replace(/\s+/g, " ").trim();
    const footerStart = FOOTER_MARKER_RE.exec(joined)?.index;
    dayText.set(day, (footerStart != null ? joined.slice(0, footerStart) : joined).trim());
  }
  return { title: titleLines.filter(Boolean).join(" "), dayText };
}

const PAGE_LABELS = ["BREAKFAST", "LUNCH", "SNACK"];

async function pdfPages(fileId: string): Promise<string[]> {
  const res = await fetch(`https://drive.google.com/uc?export=download&id=${fileId}`, {
    headers: { "user-agent": "Mozilla/5.0 (compatible; SchoolMenuBot/1.0)" },
  });
  if (!res.ok) throw new Error(`Could not download the menu PDF (${res.status})`);
  const buf = new Uint8Array(await res.arrayBuffer());
  const doc = await getDocumentProxy(buf);
  const { items } = await extractTextItems(doc);
  return items.map((pageItems) => {
    const { title, dayText } = reconstructPage(pageItems);
    const days = [...dayText.keys()].sort((a, b) => a - b);
    const lines = days.map((day) => `Day ${day}: ${dayText.get(day) || "(blank)"}`);
    return `${title}\n${lines.join("\n")}`;
  });
}

const SYSTEM_PROMPT = `You convert an already-parsed school meal calendar into JSON.
Each page (BREAKFAST, LUNCH, or SNACK) has been pre-processed into one line per day of the
month, in the exact format "Day N: <item text>" or "Day N: (blank)" when that day's cell has no
menu item. This day-to-text mapping was built from the PDF's actual table columns and is already
correct and complete — do not renumber, reorder, shift, or guess at which day text belongs to;
just carry each day's text into the JSON exactly as given.
Return ONLY JSON of the shape:
{"month":"September","days":[{"day":1,"breakfast":"...","lunch":"...","snack":"..."}]}
Rules:
- "month" is the calendar month name this PDF is for, read from the title text above each page's day lines. Use null if you can't tell.
- One entry per day number that appears on ANY of the three pages, sorted ascending — union them; a day that's "(blank)" on every page still gets an entry with all meals null.
- "(blank)" for a given meal means null for that meal — never invent text for it and never let it absorb text from a neighboring day.
- Keep the item wording exactly as given, including "Upon Request: ..." alternatives.
- If a day's text says HOLIDAY or NO SCHOOL, use exactly "HOLIDAY" for every meal that day.
- Respond with ONLY the JSON object — no markdown code fences, no explanation, no other text.`;

async function parseWithAI(pages: string[]): Promise<{ month: string | null; days: MenuDay[] }> {
  const parsed = (await callClaudeForJson(
    SYSTEM_PROMPT,
    pages.map((p, i) => `--- ${PAGE_LABELS[i] ?? `PAGE ${i + 1}`} PAGE ---\n${p}`).join("\n\n"),
  )) as {
    month?: string | null;
    days?: {
      day: number;
      breakfast?: string | null;
      lunch?: string | null;
      snack?: string | null;
    }[];
  };
  const days = (parsed.days ?? [])
    .filter((d) => Number.isInteger(d.day) && d.day >= 1 && d.day <= 31)
    .map((d) => ({
      day: d.day,
      breakfast: d.breakfast || null,
      lunch: d.lunch || null,
      snack: d.snack || null,
      breakfastAllergens: null as string[] | null,
      lunchAllergens: null as string[] | null,
      snackAllergens: null as string[] | null,
      lunchVegetarian: null as boolean | null,
    }))
    .sort((a, b) => a.day - b.day);
  return { month: parsed.month || null, days };
}

export async function getMonthMenu(month: string, year: number): Promise<MonthMenu> {
  const key = `${month}-${year}`;
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
  const past = isPastMonth(month, year, now);

  const memHit = cache.get(key);
  if (memHit && isCacheEntryUsable(memHit, past)) return memHit.value;

  const persistedHit = await readPersistedCache(key);
  if (persistedHit && isCacheEntryUsable(persistedHit, past)) {
    cache.set(key, persistedHit);
    return persistedHit.value;
  }

  // A month that's calendar-past with nothing at all on file (fresh or stale) is treated as
  // permanently unfetchable rather than worth a live check every time: SFUSD has only shown two
  // months' links live at once in practice, so an old month can disappear from the page with no
  // notice, and there's no reason to keep paying the 15-20s parse cost for a month we already
  // know has no archived copy.
  if (past && !persistedHit) {
    throw new Error(`No archived Pre-K menu on file for ${month} ${year}.`);
  }

  try {
    const fileId = await findPreKMenuFileId(month);
    if (!fileId) {
      throw new Error(`SFUSD hasn't posted the Pre-K menu for ${month} yet.`);
    }

    const pages = await pdfPages(fileId);
    const { month: detectedMonth, days } = await parseWithAI(pages);

    // findPreKMenuFileId already fetches the link labeled for the requested month, so this
    // should always match — but it's a cheap sanity check against SFUSD mislabeling a link or
    // reusing a prior month's file under a new month's label, so it stays as a safety net.
    if (detectedMonth && detectedMonth.toLowerCase() !== month.toLowerCase()) {
      throw new Error(`SFUSD hasn't posted the Pre-K menu for ${month} yet.`);
    }

    try {
      const allergenIndex = await getAllergenIndex();
      for (const d of days) {
        d.breakfastAllergens = matchAllergens(d.breakfast, allergenIndex.breakfast);
        d.lunchAllergens = matchAllergens(d.lunch, allergenIndex.lunch);
        d.snackAllergens = matchAllergens(d.snack, allergenIndex.snack);
        d.lunchVegetarian = matchVegetarian(d.lunch, allergenIndex.lunch);
      }
    } catch (error) {
      // Allergen matching is best-effort and never blocks the menu itself.
      console.error("Allergen matching failed", error);
    }

    const value: MonthMenu = {
      month,
      year,
      sourceUrl: MENUS_PAGE_URL,
      pdfUrl: `https://drive.google.com/file/d/${fileId}/view`,
      days,
    };
    const entry: CacheEntry = {
      value,
      expires: Date.now() + TTL_MS,
      schemaVersion: CACHE_SCHEMA_VERSION,
    };
    cache.set(key, entry);
    await writePersistedCache(key, entry);
    return value;
  } catch (error) {
    // The live source has moved on — SFUSD swapped their one standing PDF link to a different
    // month before our own calendar check caught up — or is just temporarily unreachable. If we
    // have ANY previously-successful data for this exact month on file, however stale, serving
    // that beats a dead "no meals posted" page, especially once the live source can genuinely
    // never produce this month's menu again.
    if (persistedHit) {
      cache.set(key, persistedHit);
      return persistedHit.value;
    }
    throw error;
  }
}

/**
 * Pre-warm the cache for the current and next month so the first visitor of a
 * new month doesn't wait for a PDF download + AI parse. Called by the
 * /api/public/refresh-menus cron endpoint.
 *
 * A failure for one month (e.g. next month's PDF not posted yet) is not fatal —
 * it just means that month stays cold until SFUSD publishes it.
 */
export async function prewarmMenus(): Promise<{
  warmed: string[];
  skipped: { month: string; error: string }[];
}> {
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
  const warmed: string[] = [];
  const skipped: { month: string; error: string }[] = [];

  const targets: { month: string; year: number }[] = [];
  for (let offset = 0; offset <= 1; offset += 1) {
    const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    targets.push({ month: MONTHS[d.getMonth()]!, year: d.getFullYear() });
  }

  await Promise.all(
    targets.map(async (t) => {
      try {
        await getMonthMenu(t.month, t.year);
        warmed.push(`${t.month} ${t.year}`);
      } catch (error) {
        // Surfacing the real error (not just the month name) here means a prewarm failure can be
        // diagnosed from the /api/public/refresh-menus response alone, without a throwaway debug
        // route each time — this is what caught the SFUSD page-layout change below.
        skipped.push({
          month: `${t.month} ${t.year}`,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }),
  );

  return { warmed, skipped };
}
