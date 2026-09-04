/**
 * Splits a menu day's raw meal text (e.g. "Turkey & Cheese Sandwich Upon Request: Veggie
 * Burger") into the main item and any "Upon Request" alternative. Shared by every place that
 * renders a meal so the split logic (and what counts as "the alt") stays in one spot.
 */
export function splitMealText(text: string): { main: string; alt: string | null } {
  const [main, ...alts] = text.split(/\s*Upon Request:\s*/i);
  return { main: main ?? text, alt: alts.length > 0 ? alts.join(" · ") : null };
}
