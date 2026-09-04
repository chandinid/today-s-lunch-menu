import { extractText, getDocumentProxy } from "unpdf";

/**
 * SFUSD does not publish a Pre-K-specific allergen sheet. Chandini is working with the
 * district to get one; until that exists, the best available source is the shared Drive
 * folder ("2026-2027 SY") that SFUSD's nutrition team uses for K-12 + Pre-K allergen PDFs.
 *
 * Breakfast and Lunch allergen PDFs there are labeled "K-12" — they're NOT Pre-K-specific,
 * so their item list only partially overlaps with the actual Pre-K menu (same vendor,
 * overlapping-but-different rotation). The Snack allergen PDF IS labeled "PreK" and should
 * line up directly.
 *
 * To stay safe for food-allergy info, we never guess: we only attach an allergen list to a
 * Pre-K menu item when its wording matches an entry in these PDFs closely enough to be
 * confident it's the same dish. No match = no allergen tag shown for that item, rather than
 * an inferred guess.
 *
 * These file IDs point at the current period folder ("8. August - Sept 4, 2026" inside the
 * "2026-2027 SY" folder SFUSD shared with Chandini) and must be updated by hand each time
 * SFUSD publishes a new period folder, until either SFUSD ships a Pre-K-specific sheet or
 * this gets wired up to auto-discover the folder via the Drive API.
 */
const ALLERGEN_PDF_IDS = {
  breakfast: "1FEbonGK_RlpDHaTdCThdJEnFSD-3GdqI", // "AUGUST - Sept 4 BREAKFAST ALLERGENS.pdf" (K-12)
  lunch: "1UnjEGZh8IWhKyvjSStGBXKdZylTqgpjF", // "AUGUST LUNCH ALLERGENS.pdf" (K-12)
  snack: "1cLzl5QEjNT3PCI2XrnHgsZzXbGK9Y9O7", // "AUGUST PreK SNACK ALLERGENS.pdf" (Pre-K)
} as const;

/**
 * Vegetarian comes along for the ride here because the K-12 lunch allergen sheet already
 * marks vegetarian entrees with the word "Veg" right after the item name — the same source
 * document, no extra fetch, no guessing.
 */
export type AllergenEntry = { allergens: string[]; vegetarian: boolean };
export type AllergenIndex = Record<string, AllergenEntry>;
type MealKey = keyof typeof ALLERGEN_PDF_IDS;

type CacheEntry = { value: Record<MealKey, AllergenIndex>; expires: number };
let cache: CacheEntry | null = null;
const TTL_MS = 1000 * 60 * 60 * 6;

/**
 * Lowercase, strip punctuation/whitespace/veg-markers, and crudely singularize each word
 * (the same dish gets re-typed slightly differently month to month — e.g. "Animal Cracker
 * w/ Apple" vs "Animal Crackers & Apple" — so a trailing "s" shouldn't break a match).
 */
const CONNECTOR_WORDS = new Set(["w", "and", "with"]);

export function normalizeItemName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\(ps\)/gi, "")
    .replace(/\bveg\b/gi, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter((word) => word && !CONNECTOR_WORDS.has(word))
    .map((word) => (word.length > 3 && word.endsWith("s") ? word.slice(0, -1) : word))
    .join(" ");
}

async function pdfText(fileId: string): Promise<string> {
  const res = await fetch(`https://drive.google.com/uc?export=download&id=${fileId}`, {
    headers: { "user-agent": "Mozilla/5.0 (compatible; SchoolMenuBot/1.0)" },
  });
  if (!res.ok) throw new Error(`Could not download allergen PDF (${res.status})`);
  const buf = new Uint8Array(await res.arrayBuffer());
  const doc = await getDocumentProxy(buf);
  const { text } = await extractText(doc, { mergePages: true });
  return Array.isArray(text) ? text.join("\n") : text;
}

const ITEM_SYSTEM_PROMPT = `You convert a school meal allergen sheet into JSON.
The sheet lists, for a month, each date followed by one or more menu items and the allergens
for that item (sometimes labeled "Allergens" or "Allergens & Meat Types"). Some item names are
followed by the word "Veg" (a vegetarian marker) before the allergens list.
Return ONLY JSON of the shape:
{"items":[{"name":"Cheese Pizza","allergens":["Wheat","Soy","Milk","Tomato"],"vegetarian":true}]}
Rules:
- One entry per DISTINCT menu item name that appears anywhere in the sheet (an item repeated
  on multiple dates should appear once).
- "name" should be the item's dish name only — strip the date, strip a trailing "Veg" marker.
- "vegetarian" is true only if that item's row includes the word "Veg" right after the name;
  false otherwise. Do not infer this from the dish name — only from the printed "Veg" marker.
- "allergens" is the list exactly as printed for that item (include named meats like Chicken,
  Beef, Turkey, Pork if listed). Do not infer or add anything not printed on the sheet.
- If an item has no allergens listed, use an empty array, not null.`;

async function parseItemsWithAI(text: string): Promise<AllergenIndex> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("AI is not configured for this project");

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "google/gemini-3-flash",
      messages: [
        { role: "system", content: ITEM_SYSTEM_PROMPT },
        { role: "user", content: text },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Allergen sheet parsing failed [${res.status}]: ${body.slice(0, 300)}`);
  }

  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const content = data.choices?.[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(content) as {
    items?: { name?: string; allergens?: string[]; vegetarian?: boolean }[];
  };

  const index: AllergenIndex = {};
  for (const item of parsed.items ?? []) {
    if (!item.name) continue;
    const key = normalizeItemName(item.name);
    if (!key || index[key]) continue;
    index[key] = {
      allergens: Array.isArray(item.allergens) ? item.allergens.filter(Boolean) : [],
      vegetarian: item.vegetarian === true,
    };
  }
  return index;
}

/**
 * Fetches + parses all three allergen PDFs into per-meal {normalizedItemName: allergens[]}
 * indexes, cached for 6 hours. A failure for one meal type is not fatal — that meal's index
 * is just empty, so its items show no allergen tag rather than breaking the whole menu.
 */
export async function getAllergenIndex(): Promise<Record<MealKey, AllergenIndex>> {
  if (cache && cache.expires > Date.now()) return cache.value;

  const entries = await Promise.all(
    (Object.keys(ALLERGEN_PDF_IDS) as MealKey[]).map(async (meal) => {
      try {
        const text = await pdfText(ALLERGEN_PDF_IDS[meal]);
        const index = await parseItemsWithAI(text);
        return [meal, index] as const;
      } catch (error) {
        console.error(`Allergen index failed for ${meal}`, error);
        return [meal, {} as AllergenIndex] as const;
      }
    }),
  );

  const value = Object.fromEntries(entries) as Record<MealKey, AllergenIndex>;
  cache = { value, expires: Date.now() + TTL_MS };
  return value;
}

/**
 * Matches a menu day's item text (e.g. "Cheese Pizza" or "Turkey & Cheese Sandwich Upon
 * Request: Veggie Burger") against an allergen index. Only the main item (before any
 * "Upon Request:") is matched. Returns null (no tag shown) rather than guessing when there's
 * no confident match, when the item is HOLIDAY, or when there's no item that day.
 */
export function matchAllergens(mealText: string | null, index: AllergenIndex): string[] | null {
  const hit = lookup(mealText, index);
  return hit && hit.allergens.length > 0 ? hit.allergens : null;
}

/**
 * Whether a day's MAIN item (before any "Upon Request:") is vegetarian, per the "Veg" marker
 * on the matching entry in the K-12 lunch allergen sheet. Returns null — not "not vegetarian"
 * — when there's no confident match, so the UI can simply omit the leaf icon rather than
 * assert a wrong answer either way.
 */
export function matchVegetarian(mealText: string | null, index: AllergenIndex): boolean | null {
  const hit = lookup(mealText, index);
  return hit ? hit.vegetarian : null;
}

function lookup(mealText: string | null, index: AllergenIndex): AllergenEntry | null {
  if (!mealText || mealText === "HOLIDAY") return null;
  const main = mealText.split(/\s*Upon Request:\s*/i)[0] ?? mealText;
  const key = normalizeItemName(main);
  return index[key] ?? null;
}
