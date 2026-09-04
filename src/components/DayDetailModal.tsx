import type { MenuDay } from "@/lib/menu.functions";
import { splitMealText } from "@/lib/meal-text";

export const LEAF = "🍃";

export const MEALS = [
  {
    key: "breakfast",
    allergensKey: "breakfastAllergens",
    label: "Breakfast",
    chip: "bg-accent text-accent-foreground",
    tilt: "rotate-2",
  },
  {
    key: "lunch",
    allergensKey: "lunchAllergens",
    label: "Lunch",
    chip: "bg-primary text-primary-foreground",
    tilt: "-rotate-2",
  },
  {
    key: "snack",
    allergensKey: "snackAllergens",
    label: "Snack",
    chip: "bg-berry text-berry-foreground",
    tilt: "-rotate-1",
  },
] as const;

/** Full-detail popup for one day's meals — breakfast/lunch/snack, "Upon Request" alternatives,
 * allergen tags, and a link to the source PDF. Shared by the month view and the week strip so a
 * tapped day looks the same no matter where it was tapped from. */
export function DayDetailModal({
  entry,
  month,
  pdfUrl,
  onClose,
}: {
  entry: MenuDay;
  month: string;
  pdfUrl: string | undefined;
  onClose: () => void;
}) {
  const holiday = entry.lunch === "HOLIDAY" || entry.breakfast === "HOLIDAY";
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${month} ${entry.day} meals`}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-4 sm:items-center"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-lift)] sm:p-8"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl">
            {month} {entry.day}
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-full border border-border bg-background text-lg font-bold text-primary hover:bg-secondary"
          >
            ✕
          </button>
        </div>

        {holiday ? (
          <p className="mt-4 text-sm font-bold text-berry">Holiday — no meals served</p>
        ) : (
          <dl className="mt-4 space-y-4">
            {MEALS.map((meal) => {
              const value = entry[meal.key];
              if (!value) return null;
              const { main, alt } = splitMealText(value);
              const allergens = entry[meal.allergensKey];
              const vegetarianMain = meal.key === "lunch" && entry.lunchVegetarian === true;
              return (
                <div key={meal.key}>
                  <dt className="flex items-center gap-2">
                    <span
                      className={`rounded-md border-2 border-white px-3 py-1 text-xs font-extrabold uppercase tracking-widest shadow-sm ${meal.chip} ${meal.tilt}`}
                    >
                      {meal.label}
                    </span>
                  </dt>
                  <dd className="mt-2 flex items-start gap-1.5 font-display text-lg leading-snug">
                    {vegetarianMain ? <span aria-hidden="true">{LEAF}</span> : null}
                    <span>{main}</span>
                  </dd>
                  {alt ? (
                    <div className="mt-2 flex items-start gap-1.5 rounded-2xl bg-secondary/60 px-3 py-2">
                      {meal.key === "lunch" ? (
                        <span aria-hidden="true" className="mt-0.5">
                          {LEAF}
                        </span>
                      ) : null}
                      <p className="font-display text-lg leading-snug">
                        <span className="mr-1.5 align-middle text-xs font-extrabold uppercase tracking-wide text-muted-foreground">
                          Upon request:
                        </span>
                        {alt}
                      </p>
                    </div>
                  ) : null}
                  {allergens && allergens.length > 0 ? (
                    <p className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="font-bold uppercase tracking-wide text-muted-foreground">
                        Contains:
                      </span>
                      {allergens.map((a) => (
                        <span
                          key={a}
                          className="rounded-md border border-border bg-secondary px-2 py-0.5 font-bold text-foreground"
                        >
                          {a}
                        </span>
                      ))}
                    </p>
                  ) : null}
                </div>
              );
            })}
            <p className="border-t border-border pt-3 text-xs text-muted-foreground">
              Allergen tags are matched from SFUSD's district allergen sheets where the item name
              lines up closely enough to be confident — they aren't official Pre-K records and won't
              cover every item. Always confirm with your child's teacher or the school for a
              confirmed allergen.
            </p>
          </dl>
        )}

        {pdfUrl ? (
          <p className="mt-6 border-t border-border pt-4 text-sm">
            <a
              className="font-bold text-primary underline underline-offset-2"
              href={pdfUrl}
              target="_blank"
              rel="noreferrer"
            >
              View the full source PDF
            </a>
          </p>
        ) : null}
      </div>
    </div>
  );
}
