import type { MenuDay } from "@/lib/menu.functions";
import { splitMealText } from "@/lib/meal-text";

const LEAF = "🍃";
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

const MEALS = [
  { key: "breakfast", label: "B", color: "text-accent" },
  { key: "lunch", label: "L", color: "text-primary" },
  { key: "snack", label: "S", color: "text-berry" },
] as const;

type Cell = { day: number; entry: MenuDay | undefined } | null;

/** Monday-Friday calendar of the month's meals. A 5-across grid on wider screens; a single
 * scrolling column (no sideways scrolling) on phones, since squeezing 5 columns onto a phone
 * screen was what made the calendar feel clunky to use there. */
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
    <div>
      {/* Phones: one day per row, full width, no horizontal scrolling. */}
      <div className="grid grid-cols-1 gap-2 sm:hidden">
        {cells.map((cell, i) =>
          cell ? (
            <CalendarCell
              key={cell.day}
              cell={cell}
              weekday={WEEKDAYS[i % 5]}
              month={month}
              todayDate={todayDate}
              onSelectDay={onSelectDay}
            />
          ) : null,
        )}
      </div>

      {/* Tablet and up: the classic 5-across week grid. */}
      <div className="hidden overflow-x-auto sm:block">
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
            {cells.map((cell, i) =>
              cell ? (
                <CalendarCell
                  key={cell.day}
                  cell={cell}
                  month={month}
                  todayDate={todayDate}
                  onSelectDay={onSelectDay}
                />
              ) : (
                <div key={`empty-${i}`} className="min-h-32 rounded-2xl" />
              ),
            )}
          </div>
        </div>
      </div>

      <p className="mt-3 text-center text-xs text-muted-foreground">
        <span className="font-extrabold text-accent">B</span> = Breakfast ·{" "}
        <span className="font-extrabold text-primary">L</span> = Lunch ·{" "}
        <span className="font-extrabold text-berry">S</span> = Snack ·{" "}
        <span className="font-extrabold text-foreground">UP</span> = Upon request (veggie alt) — tap
        a day for details
      </p>
    </div>
  );
}

/** One day's cell — shared by the mobile single-column layout and the desktop 5-across grid. */
function CalendarCell({
  cell,
  weekday,
  month,
  todayDate,
  onSelectDay,
}: {
  cell: { day: number; entry: MenuDay | undefined };
  weekday?: string | undefined;
  month: string;
  todayDate: number | null;
  onSelectDay?: ((day: number) => void) | undefined;
}) {
  const { day, entry } = cell;
  const holiday = entry?.lunch === "HOLIDAY" || entry?.breakfast === "HOLIDAY";
  const isToday = todayDate === day;
  const clickable = Boolean(onSelectDay) && Boolean(entry) && !holiday;

  return (
    <button
      type="button"
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
        <span className="flex items-baseline gap-1.5">
          {weekday ? (
            <span className="text-[0.7rem] font-extrabold uppercase tracking-widest text-muted-foreground">
              {weekday}
            </span>
          ) : null}
          <span className="font-display text-2xl font-bold">{day}</span>
        </span>
        {isToday ? (
          <span className="rounded-full bg-primary px-2 py-0.5 text-[0.6rem] font-extrabold uppercase tracking-widest text-primary-foreground">
            Today
          </span>
        ) : null}
      </div>
      {holiday ? (
        <p className="mt-2 text-xs font-bold text-berry">Holiday — no meals</p>
      ) : entry ? (
        <ul className="mt-1.5 space-y-1.5 text-[0.72rem] leading-snug">
          {MEALS.map((meal) => {
            const value = entry[meal.key];
            if (!value) return null;
            const { main, alt } = splitMealText(value);
            const vegetarianMain = meal.key === "lunch" && entry.lunchVegetarian === true;
            return (
              <li key={meal.key} className="flex gap-1.5">
                <span className={`mt-px shrink-0 font-extrabold ${meal.color}`}>{meal.label}</span>
                <span className="min-w-0">
                  <span className="line-clamp-2">
                    {vegetarianMain ? <span aria-hidden="true">{LEAF} </span> : null}
                    {main}
                  </span>
                  {alt ? (
                    <span className="mt-1 flex items-start gap-1 rounded-md bg-secondary/70 px-1 py-0.5 font-extrabold text-foreground">
                      {meal.key === "lunch" ? <span aria-hidden="true">{LEAF}</span> : null}
                      <span className="line-clamp-2">
                        <span className="mr-1 text-[0.62rem] font-extrabold uppercase text-muted-foreground">
                          UP:
                        </span>
                        {alt}
                      </span>
                    </span>
                  ) : null}
                </span>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-2 text-xs text-muted-foreground">No meals posted</p>
      )}
    </button>
  );
}
