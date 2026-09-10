import { n as getDocumentProxy, t as extractText } from "../_libs/unpdf.mjs";
import { t as getStore } from "../_libs/@netlify/blobs+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/menu.server-83A6iZwI.js
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var CLAUDE_MODEL = "claude-haiku-4-5-20251001";
var CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";
/**
* Calls Claude (Anthropic's API directly — this app runs off Lovable's hosting now, so it
* needs its own AI key rather than Lovable's built-in gateway) with a system prompt + user
* content, and returns the parsed JSON object from its reply.
*
* Claude is instructed (via the system prompt) to respond with ONLY JSON, but we defensively
* strip a markdown code fence in case the model wraps its answer in one anyway.
*/
async function callClaudeForJson(systemPrompt, userContent, { maxTokens = 4096 } = {}) {
	const apiKey = process.env["ANTHROPIC_API_KEY"];
	if (!apiKey) throw new Error("AI is not configured for this project (missing ANTHROPIC_API_KEY)");
	const res = await fetch(CLAUDE_API_URL, {
		method: "POST",
		headers: {
			"content-type": "application/json",
			"x-api-key": apiKey,
			"anthropic-version": "2023-06-01"
		},
		body: JSON.stringify({
			model: CLAUDE_MODEL,
			max_tokens: maxTokens,
			system: systemPrompt,
			messages: [{
				role: "user",
				content: userContent
			}]
		})
	});
	if (!res.ok) {
		const body = await res.text();
		throw new Error(`Claude request failed [${res.status}]: ${body.slice(0, 300)}`);
	}
	const jsonText = ((await res.json()).content?.find((block) => block.type === "text")?.text ?? "").trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
	try {
		return JSON.parse(jsonText);
	} catch {
		throw new Error(`Claude did not return valid JSON: ${jsonText.slice(0, 300)}`);
	}
}
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
var ALLERGEN_PDF_IDS = {
	breakfast: "1FEbonGK_RlpDHaTdCThdJEnFSD-3GdqI",
	lunch: "1UnjEGZh8IWhKyvjSStGBXKdZylTqgpjF",
	snack: "1cLzl5QEjNT3PCI2XrnHgsZzXbGK9Y9O7"
};
var cache$1 = null;
var TTL_MS$1 = 216e5;
/**
* Lowercase, strip punctuation/whitespace/veg-markers, and crudely singularize each word
* (the same dish gets re-typed slightly differently month to month — e.g. "Animal Cracker
* w/ Apple" vs "Animal Crackers & Apple" — so a trailing "s" shouldn't break a match).
*/
var CONNECTOR_WORDS = /* @__PURE__ */ new Set([
	"w",
	"and",
	"with"
]);
function normalizeItemName(name) {
	return name.toLowerCase().replace(/\(ps\)/gi, "").replace(/\bveg\b/gi, "").replace(/[^a-z0-9]+/g, " ").trim().split(/\s+/).filter((word) => word && !CONNECTOR_WORDS.has(word)).map((word) => word.length > 3 && word.endsWith("s") ? word.slice(0, -1) : word).join(" ");
}
async function pdfText(fileId) {
	const res = await fetch(`https://drive.google.com/uc?export=download&id=${fileId}`, { headers: { "user-agent": "Mozilla/5.0 (compatible; SchoolMenuBot/1.0)" } });
	if (!res.ok) throw new Error(`Could not download allergen PDF (${res.status})`);
	const buf = new Uint8Array(await res.arrayBuffer());
	const doc = await getDocumentProxy(buf);
	const { text } = await extractText(doc, { mergePages: true });
	return Array.isArray(text) ? text.join("\n") : text;
}
var ITEM_SYSTEM_PROMPT = `You convert a school meal allergen sheet into JSON.
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
- If an item has no allergens listed, use an empty array, not null.
- Respond with ONLY the JSON object — no markdown code fences, no explanation, no other text.`;
async function parseItemsWithAI(text) {
	const parsed = await callClaudeForJson(ITEM_SYSTEM_PROMPT, text);
	const index = {};
	for (const item of parsed.items ?? []) {
		if (!item.name) continue;
		const key = normalizeItemName(item.name);
		if (!key || index[key]) continue;
		index[key] = {
			allergens: Array.isArray(item.allergens) ? item.allergens.filter(Boolean) : [],
			vegetarian: item.vegetarian === true
		};
	}
	return index;
}
/**
* Fetches + parses all three allergen PDFs into per-meal {normalizedItemName: allergens[]}
* indexes, cached for 6 hours. A failure for one meal type is not fatal — that meal's index
* is just empty, so its items show no allergen tag rather than breaking the whole menu.
*/
async function getAllergenIndex() {
	if (cache$1 && cache$1.expires > Date.now()) return cache$1.value;
	const entries = await Promise.all(Object.keys(ALLERGEN_PDF_IDS).map(async (meal) => {
		try {
			return [meal, await parseItemsWithAI(await pdfText(ALLERGEN_PDF_IDS[meal]))];
		} catch (error) {
			console.error(`Allergen index failed for ${meal}`, error);
			return [meal, {}];
		}
	}));
	const value = Object.fromEntries(entries);
	cache$1 = {
		value,
		expires: Date.now() + TTL_MS$1
	};
	return value;
}
/**
* Matches a menu day's item text (e.g. "Cheese Pizza" or "Turkey & Cheese Sandwich Upon
* Request: Veggie Burger") against an allergen index. Only the main item (before any
* "Upon Request:") is matched. Returns null (no tag shown) rather than guessing when there's
* no confident match, when the item is HOLIDAY, or when there's no item that day.
*/
function matchAllergens(mealText, index) {
	const hit = lookup(mealText, index);
	return hit && hit.allergens.length > 0 ? hit.allergens : null;
}
/**
* Whether a day's MAIN item (before any "Upon Request:") is vegetarian, per the "Veg" marker
* on the matching entry in the K-12 lunch allergen sheet. Returns null — not "not vegetarian"
* — when there's no confident match, so the UI can simply omit the leaf icon rather than
* assert a wrong answer either way.
*/
function matchVegetarian(mealText, index) {
	const hit = lookup(mealText, index);
	return hit ? hit.vegetarian : null;
}
function lookup(mealText, index) {
	if (!mealText || mealText === "HOLIDAY") return null;
	return index[normalizeItemName(mealText.split(/\s*Upon Request:\s*/i)[0] ?? mealText)] ?? null;
}
var menu_server_exports = /* @__PURE__ */ __exportAll({
	MENUS_PAGE_URL: () => MENUS_PAGE_URL,
	MONTHS: () => MONTHS,
	findPreKMenuFileId: () => findPreKMenuFileId,
	getMonthMenu: () => getMonthMenu,
	prewarmMenus: () => prewarmMenus
});
var MENUS_PAGE_URL = "https://www.sfusd.edu/services/health-wellness/nutrition-school-meals/menus";
var MONTHS = [
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
	"December"
];
var cache = /* @__PURE__ */ new Map();
var TTL_MS = 216e5;
/** Netlify Blobs auto-configures itself from the deploy's runtime context, which is only present
* when this actually runs as a deployed Netlify Function — not in local dev. Fall back to
* memory-only caching there instead of failing. */
function blobStore() {
	try {
		return getStore({
			name: "menu-cache",
			consistency: "strong"
		});
	} catch {
		return null;
	}
}
async function readPersistedCache(key) {
	const store = blobStore();
	if (!store) return null;
	try {
		return await store.get(key, { type: "json" });
	} catch (error) {
		console.error("Netlify Blobs read failed", error);
		return null;
	}
}
async function writePersistedCache(key, entry) {
	const store = blobStore();
	if (!store) return;
	try {
		await store.setJSON(key, entry);
	} catch (error) {
		console.error("Netlify Blobs write failed", error);
	}
}
/** Scrape the SFUSD menus page for the Pre-K Breakfast/Lunch/Snack Drive file. SFUSD used to
* post a fresh "LunchMaster PreK" file per month under a "{Month} Menus" heading; they've since
* switched vendors to Revolution Foods and now publish a single standing "Pre-K Breakfast,
* Lunch, and Snack" link that they update in place, so there's just one file to find rather than
* one per month. Matching on the link's own visible text (not which vendor heading it sits
* under) keeps this working across future vendor swaps too. */
async function findPreKMenuFileId() {
	const res = await fetch(MENUS_PAGE_URL, { headers: { "user-agent": "Mozilla/5.0 (compatible; SchoolMenuBot/1.0)" } });
	if (!res.ok) throw new Error(`Could not load the SFUSD menus page (${res.status})`);
	const html = await res.text();
	const linkRe = /<a[^>]+href="https:\/\/drive\.google\.com\/file\/d\/([^/"]+)[^"]*"[^>]*>([\s\S]{0,200}?)<\/a>/g;
	let m;
	while (m = linkRe.exec(html)) {
		const text = (m[2] ?? "").replace(/<[^>]*>/g, "");
		if (/pre\s*-?\s*k/i.test(text)) return m[1];
	}
	return null;
}
async function pdfPages(fileId) {
	const res = await fetch(`https://drive.google.com/uc?export=download&id=${fileId}`, { headers: { "user-agent": "Mozilla/5.0 (compatible; SchoolMenuBot/1.0)" } });
	if (!res.ok) throw new Error(`Could not download the menu PDF (${res.status})`);
	const buf = new Uint8Array(await res.arrayBuffer());
	const doc = await getDocumentProxy(buf);
	const { text } = await extractText(doc, { mergePages: false });
	return Array.isArray(text) ? text : [text];
}
var SYSTEM_PROMPT = `You convert a school meal calendar PDF into JSON.
The PDF has pages for BREAKFAST, LUNCH and SNACK laid out as a Monday-Friday calendar.
Each cell starts with the day-of-month number followed by the meal.
Return ONLY JSON of the shape:
{"month":"September","days":[{"day":1,"breakfast":"...","lunch":"...","snack":"..."}]}
Rules:
- "month" is the calendar month name this PDF's calendar is for (e.g. "September"), read from the PDF's own heading/title text. Use null if you can't tell.
- One entry per day number that appears anywhere in the calendars, sorted ascending.
- Use null for a meal that has no item that day.
- Keep the item wording from the PDF, including "Upon Request: ..." alternatives, but strip the leading day number.
- If a cell says HOLIDAY or NO SCHOOL, use exactly "HOLIDAY" for that meal.
- Respond with ONLY the JSON object — no markdown code fences, no explanation, no other text.`;
async function parseWithAI(pages) {
	const parsed = await callClaudeForJson(SYSTEM_PROMPT, pages.map((p, i) => `--- PDF PAGE ${i + 1} ---\n${p}`).join("\n\n"));
	const days = (parsed.days ?? []).filter((d) => Number.isInteger(d.day) && d.day >= 1 && d.day <= 31).map((d) => ({
		day: d.day,
		breakfast: d.breakfast || null,
		lunch: d.lunch || null,
		snack: d.snack || null,
		breakfastAllergens: null,
		lunchAllergens: null,
		snackAllergens: null,
		lunchVegetarian: null
	})).sort((a, b) => a.day - b.day);
	return {
		month: parsed.month || null,
		days
	};
}
async function getMonthMenu(month, year) {
	const key = `${month}-${year}`;
	const memHit = cache.get(key);
	if (memHit && memHit.expires > Date.now()) return memHit.value;
	const persistedHit = await readPersistedCache(key);
	if (persistedHit && persistedHit.expires > Date.now()) {
		cache.set(key, persistedHit);
		return persistedHit.value;
	}
	const fileId = await findPreKMenuFileId();
	if (!fileId) throw new Error(`SFUSD hasn't posted the Pre-K menu for ${month} yet.`);
	const { month: detectedMonth, days } = await parseWithAI(await pdfPages(fileId));
	if (detectedMonth && detectedMonth.toLowerCase() !== month.toLowerCase()) throw new Error(`SFUSD hasn't posted the Pre-K menu for ${month} yet.`);
	try {
		const allergenIndex = await getAllergenIndex();
		for (const d of days) {
			d.breakfastAllergens = matchAllergens(d.breakfast, allergenIndex.breakfast);
			d.lunchAllergens = matchAllergens(d.lunch, allergenIndex.lunch);
			d.snackAllergens = matchAllergens(d.snack, allergenIndex.snack);
			d.lunchVegetarian = matchVegetarian(d.lunch, allergenIndex.lunch);
		}
	} catch (error) {
		console.error("Allergen matching failed", error);
	}
	const value = {
		month,
		year,
		sourceUrl: MENUS_PAGE_URL,
		pdfUrl: `https://drive.google.com/file/d/${fileId}/view`,
		days
	};
	const entry = {
		value,
		expires: Date.now() + TTL_MS
	};
	cache.set(key, entry);
	await writePersistedCache(key, entry);
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
async function prewarmMenus() {
	const now = new Date((/* @__PURE__ */ new Date()).toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
	const warmed = [];
	const skipped = [];
	const targets = [];
	for (let offset = 0; offset <= 1; offset += 1) {
		const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
		targets.push({
			month: MONTHS[d.getMonth()],
			year: d.getFullYear()
		});
	}
	await Promise.all(targets.map(async (t) => {
		try {
			await getMonthMenu(t.month, t.year);
			warmed.push(`${t.month} ${t.year}`);
		} catch {
			skipped.push(`${t.month} ${t.year}`);
		}
	}));
	return {
		warmed,
		skipped
	};
}
//#endregion
export { prewarmMenus as n, menu_server_exports as t };
