/**
 * Splits a menu day's raw meal text (e.g. "Turkey & Cheese Sandwich Upon Request: Veggie
 * Burger") into the main item and any "Upon Request" alternative. Shared by every place that
 * renders a meal so the split logic (and what counts as "the alt") stays in one spot.
 */
export function splitMealText(text: string): { main: string; alt: string | null } {
  const [main, ...alts] = text.split(/\s*Upon Request:\s*/i);
  return { main: main ?? text, alt: alts.length > 0 ? alts.join(" · ") : null };
}

/**
 * Whether a day's entry actually has any meal to show. SFUSD's source PDF sometimes has a day
 * in its calendar grid but with every cell (breakfast/lunch/snack) left blank — that comes back
 * from the scraper as an entry object with all-null fields, not as a missing entry. Every place
 * that renders a day needs to treat that the same as "no entry at all" (show the "no meal
 * posted" state), rather than silently rendering an empty list.
 */
export function hasAnyMeal<
  T extends { breakfast: string | null; lunch: string | null; snack: string | null },
>(entry: T | null | undefined): entry is T {
  return Boolean(entry && (entry.breakfast || entry.lunch || entry.snack));
}
