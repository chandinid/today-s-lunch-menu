import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { fetchMonthMenu, type MenuDay } from "@/lib/menu.functions";
import { splitMealText } from "@/lib/meal-text";
import { DayDetailModal, LEAF } from "@/components/DayDetailModal";

const MONTHS = [
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
];

const STALE_MS = 1000 * 60 * 30;

function mondayOf(date: Date): Date {
  const d = new Date(date);
  const sinceMonday = (d.getDay() + 6) % 7; // Mon = 0 .. Sun = 6
  d.setDate(d.getDate() - sinceMonday);
  d.setHours(0, 0, 0, 0);
  return d;
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** A week of day-cards ("Mon 1", "Tue 2", …) with today highlighted, that you can page
 * week-by-week — a quick-planning strip that sits above the full month view. A week
 * occasionally spans two months (e.g. the last two days of August into September), so this
 * fetches whichever month(s) the visible week actually touches. */
export function WeekStrip({ today }: { today: Date }) {
  const [weekStart, setWeekStart] = useState(() => mondayOf(today));
  const [selected, setSelected] = useState<{ date: Date; entry: MenuDay } | null>(null);

  const weekDates = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => {
        const d = new Date(weekStart);
        d.setDate(d.getDate() + i);
        return d;
      }),
    [weekStart],
  );

  const first = weekDates[0]!;
  const last = weekDates[4]!;
  const monthA = { month: MONTHS[first.getMonth()]!, year: first.getFullYear() };
  const monthB = { month: MONTHS[last.getMonth()]!, year: last.getFullYear() };
  const spansTwoMonths = monthA.month !== monthB.month || monthA.year !== monthB.year;

  const queryA = useQuery({
    queryKey: ["menu", monthA.month, monthA.year],
    queryFn: () => fetchMonthMenu({ data: monthA }),
    staleTime: STALE_MS,
  });
  const queryB = useQuery({
    queryKey: ["menu", monthB.month, monthB.year],
    queryFn: () => fetchMonthMenu({ data: monthB }),
    staleTime: STALE_MS,
    enabled: spansTwoMonths,
  });

  function menuFor(date: Date) {
    const inMonthA =
      date.getMonth() === first.getMonth() && date.getFullYear() === first.getFullYear();
    const query = inMonthA ? queryA : queryB;
    if (!query.data?.ok) return { pending: query.isPending, entry: undefined, pdfUrl: undefined };
    return {
      pending: false,
      entry: query.data.menu.days.find((d) => d.day === date.getDate()),
      pdfUrl: query.data.menu.pdfUrl,
    };
  }

  const isCurrentWeek = sameDay(weekStart, mondayOf(today));

  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-extrabold uppercase tracking-widest text-muted-foreground">
          This week
        </h2>
        <div className="flex items-center gap-1.5">
          {!isCurrentWeek ? (
            <button
              type="button"
              onClick={() => setWeekStart(mondayOf(today))}
              className="rounded-full border border-border bg-card px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-primary hover:bg-secondary"
            >
              Today
            </button>
          ) : null}
          <button
            type="button"
            aria-label="Previous week"
            onClick={() =>
              setWeekStart((w) => new Date(w.getFullYear(), w.getMonth(), w.getDate() - 7))
            }
            className="flex size-8 items-center justify-center rounded-full border border-border bg-card text-lg font-bold text-primary hover:bg-secondary"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Next week"
            onClick={() =>
              setWeekStart((w) => new Date(w.getFullYear(), w.getMonth(), w.getDate() + 7))
            }
            className="flex size-8 items-center justify-center rounded-full border border-border bg-card text-lg font-bold text-primary hover:bg-secondary"
          >
            ›
          </button>
        </div>
      </div>

      <div className="mt-3 -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 sm:mx-0 sm:grid sm:grid-cols-5 sm:gap-3 sm:overflow-visible sm:px-0">
        {weekDates.map((date) => {
          const { pending, entry } = menuFor(date);
          const holiday = entry?.lunch === "HOLIDAY" || entry?.breakfast === "HOLIDAY";
          const { main, alt } =
            entry?.lunch && !holiday ? splitMealText(entry.lunch) : { main: null, alt: null };
          const vegetarianMain = entry?.lunchVegetarian === true;
          const todayFlag = sameDay(date, today);
          const clickable = Boolean(entry) && !holiday;

          return (
            <button
              key={date.toDateString()}
              type="button"
              disabled={!clickable}
              onClick={() => entry && setSelected({ date, entry })}
              className={`w-[72vw] max-w-64 shrink-0 snap-start rounded-3xl border p-4 text-left transition-transform sm:w-auto sm:max-w-none ${
                clickable
                  ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]"
                  : ""
              } ${
                todayFlag
                  ? "border-2 border-primary bg-card shadow-[var(--shadow-lift)]"
                  : holiday
                    ? "border-dashed border-border bg-card/50"
                    : "border-border bg-card/90"
              }`}
            >
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
                  {date.toLocaleDateString("en-US", { weekday: "short" })}
                </span>
                {todayFlag ? (
                  <span className="rounded-full bg-primary px-2 py-0.5 text-[0.6rem] font-extrabold uppercase tracking-widest text-primary-foreground">
                    Today
                  </span>
                ) : null}
              </div>
              <p className="font-display text-2xl font-bold">{date.getDate()}</p>

              {pending ? (
                <div className="mt-2 h-10 animate-pulse rounded-xl bg-secondary/50" />
              ) : holiday ? (
                <p className="mt-1 text-xs font-bold text-berry">Holiday — no meals</p>
              ) : entry ? (
                <div className="mt-1 text-xs leading-snug">
                  <span className="line-clamp-2">
                    {vegetarianMain ? <span aria-hidden="true">{LEAF} </span> : null}
                    {main ?? "Not served today"}
                  </span>
                  {alt ? (
                    <span className="mt-1.5 flex items-start gap-1 rounded-lg bg-secondary/70 px-1.5 py-1 font-bold text-foreground">
                      <span className="text-[0.62rem] font-extrabold uppercase text-muted-foreground">
                        UP:
                      </span>
                      <span className="line-clamp-2">{alt}</span>
                    </span>
                  ) : null}
                </div>
              ) : (
                <p className="mt-1 text-xs text-muted-foreground">No meal posted</p>
              )}
            </button>
          );
        })}
      </div>

      {selected ? (
        <DayDetailModal
          entry={selected.entry}
          month={MONTHS[selected.date.getMonth()]!}
          pdfUrl={menuFor(selected.date).pdfUrl}
          onClose={() => setSelected(null)}
        />
      ) : null}
    </section>
  );
}
