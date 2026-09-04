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
const CARD_COUNT = 7;

function isWeekday(d: Date): boolean {
  const wd = d.getDay();
  return wd !== 0 && wd !== 6;
}

function atMidnight(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function nextWeekday(from: Date, direction: 1 | -1): Date {
  const d = new Date(from);
  do {
    d.setDate(d.getDate() + direction);
  } while (!isWeekday(d));
  return d;
}

/** `count` school-week days (Mon-Fri), starting at `anchor` itself (bumped forward to the next
 * weekday if `anchor` lands on a weekend) and continuing through the following weekdays. */
function weekdaysFrom(anchor: Date, count: number): Date[] {
  const start = isWeekday(anchor) ? atMidnight(anchor) : nextWeekday(atMidnight(anchor), 1);
  const dates = [start];
  while (dates.length < count) {
    dates.push(nextWeekday(dates[dates.length - 1]!, 1));
  }
  return dates;
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** A carousel of school-day cards: today is the first card by default, followed by the next
 * school days, with arrows to page a day at a time in either direction — a quick-planning strip
 * above the full month view. The 7-day window occasionally spans two months, so this fetches
 * whichever month(s) it actually touches. */
export function WeekStrip({ today }: { today: Date }) {
  const [anchor, setAnchor] = useState(() => atMidnight(today));
  const [selected, setSelected] = useState<{ date: Date; entry: MenuDay } | null>(null);

  const weekDates = useMemo(() => weekdaysFrom(anchor, CARD_COUNT), [anchor]);

  const first = weekDates[0]!;
  const last = weekDates[weekDates.length - 1]!;
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

  const startsToday = sameDay(first, atMidnight(today));

  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-extrabold uppercase tracking-widest text-muted-foreground">
          This week
        </h2>
        <div className="flex items-center gap-1.5">
          {!startsToday ? (
            <button
              type="button"
              onClick={() => setAnchor(atMidnight(today))}
              className="rounded-full border border-border bg-card px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-primary hover:bg-secondary"
            >
              Today
            </button>
          ) : null}
          <button
            type="button"
            aria-label="Earlier"
            onClick={() => setAnchor((a) => nextWeekday(a, -1))}
            className="flex size-8 items-center justify-center rounded-full border border-border bg-card text-lg font-bold text-primary hover:bg-secondary"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Later"
            onClick={() => setAnchor((a) => nextWeekday(a, 1))}
            className="flex size-8 items-center justify-center rounded-full border border-border bg-card text-lg font-bold text-primary hover:bg-secondary"
          >
            ›
          </button>
        </div>
      </div>

      <div className="mt-3 -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2">
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
              className={`w-[72vw] max-w-64 shrink-0 snap-start rounded-3xl border p-4 text-left transition-transform ${
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
