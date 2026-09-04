import { extractText, getDocumentProxy } from "unpdf";
import { getAllergenIndex, matchAllergens, matchVegetarian } from "./allergens.server";

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

type CacheEntry = { value: MonthMenu; expires: number };
const cache = new Map<string, CacheEntry>();
const TTL_MS = 1000 * 60 * 60 * 6;

/** Scrape the SFUSD menus page for the "LunchMaster PreK" Drive file per month. */
export async function findPreKMenuFiles(): Promise<Record<string, string>> {
  const res = await fetch(MENUS_PAGE_URL, {
    headers: { "user-agent": "Mozilla/5.0 (compatible; SchoolMenuBot/1.0)" },
  });
  if (!res.ok) throw new Error(`Could not load the SFUSD menus page (${res.status})`);
  const html = await res.text();

  const headings: { month: string; index: number }[] = [];
  const headingRe = /<h[23][^>]*>\s*([A-Z][a-z]+)\s+Menus\s*<\/h[23]>/g;
  let m: RegExpExecArray | null;
  while ((m = headingRe.exec(html))) {
    const month = m[1] as string;
    if ((MONTHS as readonly string[]).includes(month)) {
      headings.push({ month, index: m.index });
    }
  }

  const result: Record<string, string> = {};
  headings.forEach((h, i) => {
    const end = headings[i + 1]?.index ?? html.length;
    const chunk = html.slice(h.index, end);
    const linkRe =
      /<a[^>]+href="https:\/\/drive\.google\.com\/file\/d\/([^/"]+)[^"]*"[^>]*>([\s\S]{0,200}?)<\/a>/g;
    let l: RegExpExecArray | null;
    while ((l = linkRe.exec(chunk))) {
      const text = (l[2] ?? "").replace(/<[^>]*>/g, "");
      if (/pre\s*-?\s*k/i.test(text)) {
        result[h.month] = l[1] as string;
        break;
      }
    }
  });

  return result;
}

async function pdfPages(fileId: string): Promise<string[]> {
  const res = await fetch(`https://drive.google.com/uc?export=download&id=${fileId}`, {
    headers: { "user-agent": "Mozilla/5.0 (compatible; SchoolMenuBot/1.0)" },
  });
  if (!res.ok) throw new Error(`Could not download the menu PDF (${res.status})`);
  const buf = new Uint8Array(await res.arrayBuffer());
  const doc = await getDocumentProxy(buf);
  const { text } = await extractText(doc, { mergePages: false });
  return Array.isArray(text) ? text : [text];
}

const SYSTEM_PROMPT = `You convert a school meal calendar PDF into JSON.
The PDF has pages for BREAKFAST, LUNCH and SNACK laid out as a Monday-Friday calendar.
Each cell starts with the day-of-month number followed by the meal.
Return ONLY JSON of the shape:
{"days":[{"day":1,"breakfast":"...","lunch":"...","snack":"..."}]}
Rules:
- One entry per day number that appears anywhere in the calendars, sorted ascending.
- Use null for a meal that has no item that day.
- Keep the item wording from the PDF, including "Upon Request: ..." alternatives, but strip the leading day number.
- If a cell says HOLIDAY or NO SCHOOL, use exactly "HOLIDAY" for that meal.`;

async function parseWithAI(pages: string[]): Promise<MenuDay[]> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("AI is not configured for this project");

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "google/gemini-3-flash",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: pages.map((p, i) => `--- PDF PAGE ${i + 1} ---\n${p}`).join("\n\n"),
        },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Menu parsing failed [${res.status}]: ${body.slice(0, 300)}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(content) as {
    days?: { day: number; breakfast?: string | null; lunch?: string | null; snack?: string | null }[];
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
  return days;
}

export async function getMonthMenu(month: string, year: number): Promise<MonthMenu> {
  const key = `${month}-${year}`;
  const hit = cache.get(key);
  if (hit && hit.expires > Date.now()) return hit.value;

  const files = await findPreKMenuFiles();
  const fileId = files[month];
  if (!fileId) {
    throw new Error(`SFUSD hasn't posted the Pre-K menu for ${month} yet.`);
  }

  const pages = await pdfPages(fileId);
  const days = await parseWithAI(pages);

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
  cache.set(key, { value, expires: Date.now() + TTL_MS });
  return value;
}

/**
 * Pre-warm the cache for the current and next month so the first visitor of a
 * new month doesn't wait for a PDF download + AI parse. Called by the
 * /api/public/refresh-menus cron endpoint.
 *
 * A failure for one month (e.g. next month's PDF not posted yet) is not fatal —
 * it just means that month stays cold until SFUSD publishes it.
 */
export async function prewarmMenus(): Promise<{ warmed: string[]; skipped: string[] }> {
  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" }),
  );
  const warmed: string[] = [];
  const skipped: string[] = [];

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
      } catch {
        skipped.push(`${t.month} ${t.year}`);
      }
    }),
  );

  return { warmed, skipped };
}
