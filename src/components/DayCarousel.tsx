import { useQuery } from "@tanstack/react-query";
import { useMemo, useRef, useState } from "react";
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

// Lunch first — it's the thing this app is for — then breakfast, then snack. Each chip gets a
// slight, fixed tilt so the row reads as hand-placed stickers rather than a uniform pill row.
const MEAL_ORDER = [
  { key: "lunch", label: "Lunch", chip: "bg-primary text-primary-foreground", tilt: "-rotate-2" },
  {
    key: "breakfast",
    label: "Breakfast",
    chip: "bg-accent text-accent-foreground",
    tilt: "rotate-2",
  },
  { key: "snack", label: "Snack", chip: "bg-berry text-berry-foreground", tilt: "-rotate-1" },
] as const;

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

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** A stacked carousel of "photo frame" day cards — today (or whichever day is selected) sits
 * large and in front, with the day before and after peeking out from behind on either side.
 * Tap a peeking card, or the arrows, to bring a different day forward; tap the front card to
 * open its full detail (allergens + source PDF), same as the calendar below. */
export function DayCarousel({ today }: { today: Date }) {
  const [selected, setSelected] = useState(() => atMidnight(today));
  const [showDetail, setShowDetail] = useState(false);

  const prevDate = useMemo(() => nextWeekday(selected, -1), [selected]);
  const nextDate = useMemo(() => nextWeekday(selected, 1), [selected]);
  const dates = useMemo(() => [prevDate, selected, nextDate], [prevDate, selected, nextDate]);

  const first = dates[0]!;
  const last = dates[2]!;
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

  function menuFor(date: Date): DayMenuInfo {
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

  const selectedMenu = menuFor(selected);
  const isToday = sameDay(selected, atMidnight(today));

  // Swipe support for mobile: drag left/right anywhere on the carousel to page days,
  // same as tapping the arrows or a peeking side card.
  const touchStartX = useRef<number | null>(null);
  const SWIPE_THRESHOLD_PX = 40;

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  }
  function handleTouchEnd(e: React.TouchEvent) {
    const startX = touchStartX.current;
    touchStartX.current = null;
    if (startX == null) return;
    const endX = e.changedTouches[0]?.clientX ?? startX;
    const delta = endX - startX;
    if (delta > SWIPE_THRESHOLD_PX) setSelected(prevDate);
    else if (delta < -SWIPE_THRESHOLD_PX) setSelected(nextDate);
  }

  return (
    <section>
      <div
        className="relative flex h-[26rem] touch-pan-y items-center justify-center sm:h-96"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <CarouselArrow label="Previous day" side="left" onClick={() => setSelected(prevDate)} />

        <DayFrame
          date={prevDate}
          menu={menuFor(prevDate)}
          today={today}
          layer="behind"
          side="left"
          onClick={() => setSelected(prevDate)}
        />
        <DayFrame
          date={nextDate}
          menu={menuFor(nextDate)}
          today={today}
          layer="behind"
          side="right"
          onClick={() => setSelected(nextDate)}
        />
        <DayFrame
          date={selected}
          menu={selectedMenu}
          today={today}
          layer="front"
          onClick={() => selectedMenu.entry && setShowDetail(true)}
        />

        <CarouselArrow label="Next day" side="right" onClick={() => setSelected(nextDate)} />
      </div>

      {!isToday ? (
        <div className="mt-2 text-center">
          <button
            type="button"
            onClick={() => setSelected(atMidnight(today))}
            className="rounded-full border border-border bg-card px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-primary hover:bg-secondary"
          >
            Back to today
          </button>
        </div>
      ) : null}

      {showDetail && selectedMenu.entry ? (
        <DayDetailModal
          entry={selectedMenu.entry}
          month={MONTHS[selected.getMonth()]!}
          pdfUrl={selectedMenu.pdfUrl}
          onClose={() => setShowDetail(false)}
        />
      ) : null}
    </section>
  );
}

function CarouselArrow({
  label,
  side,
  onClick,
}: {
  label: string;
  side: "left" | "right";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`absolute top-1/2 z-30 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card text-lg font-bold text-primary shadow-[var(--shadow-card)] hover:bg-secondary ${
        side === "left" ? "left-0 sm:left-2" : "right-0 sm:right-2"
      }`}
    >
      {side === "left" ? "‹" : "›"}
    </button>
  );
}

type DayMenuInfo = { pending: boolean; entry: MenuDay | undefined; pdfUrl: string | undefined };

function DayFrame({
  date,
  menu,
  today,
  layer,
  side,
  onClick,
}: {
  date: Date;
  menu: DayMenuInfo;
  today: Date;
  layer: "front" | "behind";
  side?: "left" | "right" | undefined;
  onClick: () => void;
}) {
  const { pending, entry } = menu;
  const holiday = entry?.lunch === "HOLIDAY" || entry?.breakfast === "HOLIDAY";
  const todayFlag = sameDay(date, atMidnight(today));

  const positioning =
    layer === "front"
      ? "z-20 rotate-0 scale-100"
      : side === "left"
        ? "z-10 -translate-x-[62%] scale-[0.82] -rotate-6 opacity-90 sm:-translate-x-[68%]"
        : "z-10 translate-x-[62%] scale-[0.82] rotate-6 opacity-90 sm:translate-x-[68%]";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`absolute w-64 shrink-0 rounded-[1.25rem] border-[6px] border-white bg-white p-3.5 text-left shadow-[var(--shadow-lift)] transition-transform duration-200 sm:w-72 ${positioning} ${
        layer === "front" ? "cursor-pointer hover:-translate-y-1" : "cursor-pointer"
      }`}
    >
      <div className={`rounded-2xl p-3.5 ${todayFlag ? "bg-secondary/70" : "bg-background"}`}>
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-sm font-extrabold uppercase tracking-widest text-muted-foreground">
            {date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
          </span>
          {todayFlag ? (
            <span className="shrink-0 -rotate-3 rounded-md border-2 border-white bg-primary px-2 py-0.5 text-[0.65rem] font-extrabold uppercase tracking-widest text-primary-foreground shadow-sm">
              Today
            </span>
          ) : null}
        </div>

        <div className="mt-2.5 space-y-2.5">
          {pending ? (
            <>
              <div className="h-11 animate-pulse rounded-xl bg-secondary/50" />
              <div className="h-9 animate-pulse rounded-xl bg-secondary/40" />
            </>
          ) : holiday ? (
            <p className="text-sm font-bold text-berry">Holiday — no meals</p>
          ) : entry ? (
            MEAL_ORDER.map((meal) => {
              const value = entry[meal.key];
              if (!value) return null;
              const { main, alt } = splitMealText(value);
              const vegetarianMain = meal.key === "lunch" && entry.lunchVegetarian === true;
              return (
                <div key={meal.key}>
                  <span
                    className={`inline-block rounded-md border-2 border-white px-2 py-0.5 text-[0.65rem] font-extrabold uppercase tracking-widest shadow-sm ${meal.chip} ${meal.tilt}`}
                  >
                    {meal.label}
                  </span>
                  <p className="mt-1 flex items-start gap-1 text-base leading-snug">
                    {vegetarianMain ? <span aria-hidden="true">{LEAF}</span> : null}
                    <span className="line-clamp-2">{main}</span>
                  </p>
                  {alt ? (
                    <p className="mt-0.5 flex items-start gap-1 rounded-md bg-secondary/70 px-1.5 py-0.5 text-xs font-bold text-foreground">
                      <span className="shrink-0 text-[0.65rem] font-extrabold uppercase text-muted-foreground">
                        UP:
                      </span>
                      <span className="line-clamp-1">{alt}</span>
                    </p>
                  ) : null}
                </div>
              );
            })
          ) : (
            <p className="text-sm text-muted-foreground">No meal posted</p>
          )}
        </div>
      </div>
    </button>
  );
}
