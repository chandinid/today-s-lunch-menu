import type { MenuDay } from "@/lib/menu.functions";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

const MEALS = [
  { key: "breakfast", label: "B", color: "text-accent" },
  { key: "lunch", label: "L", color: "text-primary" },
  { key: "snack", label: "S", color: "text-berry" },
] as const;

type Cell = { day: number; entry: MenuDay | undefined } | null;

/** Monday-Friday calendar grid of the month's meals. */
export function MenuCalendar({
  monthIndex,
  year,
  month,
  days,
  todayDate,
  onSelectDay,
}: {
  monthIndex: number;
  year: number;
  month: string;
  days: MenuDay[];
  todayDate: number | null;
  onSelectDay?: (day: number) => void;
}) {
  const byDay = new Map(days.map((d) => [d.day, d]));
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  const cells: Cell[] = [];
  const firstWeekday = new Date(year, monthIndex, 1).getDay(); // 0 Sun
  const leading = (firstWeekday + 6) % 7; // Mon = 0
  for (let i = 0; i < Math.min(leading, 5); i += 1) cells.push(null);

  for (let d = 1; d <= daysInMonth; d += 1) {
    const wd = new Date(year, monthIndex, d).getDay();
    if (wd === 0 || wd === 6) continue;
    cells.push({ day: d, entry: byDay.get(d) });
  }
  while (cells.length % 5 !== 0) cells.push(null);

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[640px]">
        <div className="grid grid-cols-5 gap-2 pb-2">
          {WEEKDAYS.map((w) => (
            <div
              key={w}
              className="text-center text-[0.7rem] font-extrabold uppercase tracking-widest text-muted-foreground"
            >
              {w}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-5 gap-2">
          {cells.map((cell, i) => {
            if (!cell) return <div key={`empty-${i}`} className="min-h-32 rounded-2xl" />;
            const { day, entry } = cell;
            const holiday =
              entry?.lunch === "HOLIDAY" || entry?.breakfast === "HOLIDAY";
            const isToday = todayDate === day;
            const clickable = Boolean(onSelectDay) && Boolean(entry) && !holiday;
            return (
              <button
                type="button"
                key={day}
                aria-label={`${month} ${day}`}
                disabled={!clickable}
                onClick={() => onSelectDay?.(day)}
                className={`min-h-32 rounded-2xl border p-2.5 text-left transition-transform ${
                  clickable ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]" : ""
                } ${
                  isToday
                    ? "border-2 border-primary bg-card shadow-[var(--shadow-lift)]"
                    : holiday
                      ? "border-dashed border-border bg-card/50"
                      : "border-border bg-card/90"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-2xl font-bold">{day}</span>
                  {isToday ? (
                    <span className="rounded-full bg-primary px-2 py-0.5 text-[0.6rem] font-extrabold uppercase tracking-widest text-primary-foreground">
                      Today
                    </span>
                  ) : null}
                </div>
                {holiday ? (
                  <p className="mt-2 text-xs font-bold text-berry">Holiday — no meals</p>
                ) : entry ? (
                  <ul className="mt-1.5 space-y-1 text-[0.72rem] leading-snug">
                    {MEALS.map((meal) =>
                      entry[meal.key] ? (
                        <li key={meal.key} className="flex gap-1.5">
                          <span className={`mt-px shrink-0 font-extrabold ${meal.color}`}>
                            {meal.label}
                          </span>
                          <span className="line-clamp-2">{entry[meal.key]}</span>
                        </li>
                      ) : null,
                    )}
                  </ul>
                ) : (
                  <p className="mt-2 text-xs text-muted-foreground">No meals posted</p>
                )}
              </button>
            );
          })}
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        <span className="font-extrabold text-accent">B</span> = Breakfast ·{" "}
        <span className="font-extrabold text-primary">L</span> = Lunch ·{" "}
        <span className="font-extrabold text-berry">S</span> = Snack — tap a day for details
      </p>
    </div>
  );
}
