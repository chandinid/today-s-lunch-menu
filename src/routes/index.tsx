import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { fetchMonthMenu, type MenuDay } from "@/lib/menu.functions";
import { MenuCalendar } from "@/components/MenuCalendar";
import { DayCarousel } from "@/components/DayCarousel";
import { DayDetailModal, LEAF, MEALS } from "@/components/DayDetailModal";
import { splitMealText } from "@/lib/meal-text";

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

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Today's Pre-K Lunch | SFUSD Menu at a Glance" },
      {
        name: "description",
        content:
          "See what's for breakfast, lunch, and snack today at SFUSD Pre-K schools, pulled straight from the monthly LunchMaster menu.",
      },
      { property: "og:title", content: "Today's Pre-K Lunch | SFUSD Menu at a Glance" },
      {
        property: "og:description",
        content:
          "Today's SFUSD Pre-K breakfast, lunch, and snack — no more digging through monthly PDFs.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function sfToday() {
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
  return now;
}

function Index() {
  const today = useMemo(sfToday, []);
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // The calendar grid needs horizontal scrolling and tiny text to fit a whole month, which
  // is hard to read on a phone. Default to the list view there instead — desktop keeps the
  // calendar default. This only runs once on mount, so picking "calendar" manually still works.
  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 639px)").matches) {
      setView("list");
    }
  }, []);
  const [cursor, setCursor] = useState({ month: today.getMonth(), year: today.getFullYear() });
  const year = cursor.year;
  const month = MONTHS[cursor.month]!;
  const isCurrentMonth = cursor.month === today.getMonth() && cursor.year === today.getFullYear();

  const { data, isPending } = useQuery({
    queryKey: ["menu", month, year],
    queryFn: () => fetchMonthMenu({ data: { month, year } }),
    staleTime: 1000 * 60 * 30,
  });

  // Prefetch adjacent months so the prev/next arrows feel instant.
  const queryClient = useQueryClient();
  const adjacent = [
    {
      month: cursor.month === 0 ? 11 : cursor.month - 1,
      year: cursor.month === 0 ? cursor.year - 1 : cursor.year,
    },
    {
      month: cursor.month === 11 ? 0 : cursor.month + 1,
      year: cursor.month === 11 ? cursor.year + 1 : cursor.year,
    },
  ];
  useEffect(() => {
    for (const a of adjacent) {
      const am = MONTHS[a.month]!;
      queryClient.prefetchQuery({
        queryKey: ["menu", am, a.year],
        queryFn: () => fetchMonthMenu({ data: { month: am, year: a.year } }),
        staleTime: 1000 * 60 * 30,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursor.month, cursor.year]);

  const days = data?.ok ? data.menu.days : [];
  const pdfUrl = data?.ok ? data.menu.pdfUrl : undefined;

  const selectedEntry = selectedDay != null ? days.find((d) => d.day === selectedDay) : undefined;

  return (
    <main className="mx-auto w-full max-w-4xl px-5 pb-20 pt-10 sm:pt-16">
      <ThemeToggle />

      <header className="reveal text-center">
        <p className="text-sm font-extrabold uppercase tracking-[0.22em] text-primary sm:text-base">
          SFUSD Pre-K · LunchMaster
        </p>
        <h1 className="mt-2 text-4xl leading-tight sm:text-5xl">What&rsquo;s on the menu today!</h1>
        <svg
          aria-hidden="true"
          viewBox="0 0 220 14"
          className="mx-auto mt-1.5 h-3 w-40 text-primary sm:w-52"
        >
          <path
            d="M2 8c8-8 16 6 24-2s16 6 24-2 16 6 24-2 16 6 24-2 16 6 24-2 16 6 24-2 16 6 24-2"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </header>

      <section className="reveal mt-8 [animation-delay:120ms]">
        <DayCarousel today={today} />
      </section>

      <section className="reveal mt-12 [animation-delay:220ms]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl">The whole month</h2>
          <div className="flex items-center gap-2">
            <div className="mr-1 flex rounded-xl border-2 border-border bg-card p-1">
              {(["calendar", "list"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setView(v)}
                  aria-pressed={view === v}
                  className={`rounded-lg px-3 py-1 text-xs font-extrabold uppercase tracking-widest transition-colors ${
                    view === v
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-primary"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
            <NavButton
              label="Previous month"
              onClick={() =>
                setCursor((c) => ({
                  month: c.month === 0 ? 11 : c.month - 1,
                  year: c.month === 0 ? c.year - 1 : c.year,
                }))
              }
            >
              ‹
            </NavButton>
            <span className="min-w-28 text-center text-sm font-bold">
              {month} {year}
            </span>
            <NavButton
              label="Next month"
              onClick={() =>
                setCursor((c) => ({
                  month: c.month === 11 ? 0 : c.month + 1,
                  year: c.month === 11 ? c.year + 1 : c.year,
                }))
              }
            >
              ›
            </NavButton>
          </div>
        </div>

        {isPending ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-2xl border border-border bg-card/70"
              />
            ))}
          </div>
        ) : view === "calendar" ? (
          <div className="mt-5">
            <MenuCalendar
              monthIndex={cursor.month}
              year={year}
              month={month}
              days={days}
              todayDate={isCurrentMonth ? today.getDate() : null}
              onSelectDay={(d) => setSelectedDay(d)}
            />
          </div>
        ) : (
          <>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {days.map((d) => (
                <DayCard
                  key={d.day}
                  entry={d}
                  isToday={isCurrentMonth && d.day === today.getDate()}
                  month={month}
                  onClick={() => setSelectedDay(d.day)}
                />
              ))}
            </div>
            {days.length > 0 ? (
              <p className="mt-3 text-center text-xs text-muted-foreground">
                <span className="font-extrabold text-foreground">UP</span> = Upon request
                (vegetarian alternative)
              </p>
            ) : null}
          </>
        )}

        {!isPending && days.length === 0 && data?.ok ? (
          <Notice
            title="Nothing posted yet"
            body={`SFUSD hasn't published the ${month} Pre-K menu.`}
          />
        ) : null}
      </section>

      <footer className="mt-14 border-t border-border pt-6 text-center text-xs text-muted-foreground">
        <p>
          Menus are read automatically from the SFUSD{" "}
          <a
            className="font-bold text-primary underline underline-offset-2"
            href="https://www.sfusd.edu/services/health-wellness/nutrition-school-meals/menus"
            target="_blank"
            rel="noreferrer"
          >
            nutrition & school meals page
          </a>
          {pdfUrl ? (
            <>
              {" "}
              ·{" "}
              <a
                className="font-bold text-primary underline underline-offset-2"
                href={pdfUrl}
                target="_blank"
                rel="noreferrer"
              >
                {month} source PDF
              </a>
            </>
          ) : null}
          . Menus are subject to change.
        </p>
        <a
          className="mt-4 inline-block"
          href="https://www.buymeacoffee.com/Chandinid"
          target="_blank"
          rel="noreferrer"
        >
          <img
            src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=&slug=Chandinid&button_colour=FF5F5F&font_colour=ffffff&font_family=Cookie&outline_colour=000000&coffee_colour=FFDD00"
            alt="Buy me a coffee"
            className="mx-auto h-auto"
          />
        </a>
      </footer>

      {selectedEntry ? (
        <DayDetailModal
          entry={selectedEntry}
          month={month}
          pdfUrl={pdfUrl}
          onClose={() => setSelectedDay(null)}
        />
      ) : null}
    </main>
  );
}

function DayCard({
  entry,
  isToday,
  month,
  onClick,
}: {
  entry: MenuDay;
  isToday: boolean;
  month: string;
  onClick: () => void;
}) {
  const holiday = entry.lunch === "HOLIDAY" || entry.breakfast === "HOLIDAY";
  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className={`cursor-pointer rounded-2xl border p-4 transition-transform hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)] ${
        isToday
          ? "border-2 border-primary bg-card shadow-[var(--shadow-lift)]"
          : "border-border bg-card/90"
      }`}
    >
      <div className="flex items-baseline justify-between">
        <h3 className="text-lg">
          {month} {entry.day}
        </h3>
        {isToday ? (
          <span className="-rotate-3 rounded-md border-2 border-white bg-primary px-2.5 py-1 text-[0.65rem] font-extrabold uppercase tracking-widest text-primary-foreground shadow-sm">
            Today
          </span>
        ) : null}
      </div>
      {holiday ? (
        <p className="mt-2 text-sm font-bold text-berry">Holiday — no meals served</p>
      ) : (
        <dl className="mt-2 space-y-3 text-sm">
          {MEALS.map((meal) => {
            const value = entry[meal.key];
            if (!value) return null;
            const { main, alt } = splitMealText(value);
            const vegetarianMain = meal.key === "lunch" && entry.lunchVegetarian === true;
            return (
              <div key={meal.key} className="flex gap-2">
                <dt className="w-20 shrink-0 font-bold uppercase tracking-wide text-muted-foreground">
                  {meal.label}
                </dt>
                <dd className="flex-1">
                  <span className="line-clamp-2">
                    {vegetarianMain ? <span aria-hidden="true">{LEAF} </span> : null}
                    {main}
                  </span>
                  {alt ? (
                    <span className="mt-1.5 flex items-start gap-1.5 rounded-xl bg-secondary/60 px-2.5 py-1.5 font-bold text-foreground">
                      {meal.key === "lunch" ? <span aria-hidden="true">{LEAF}</span> : null}
                      <span>
                        <span className="mr-1 text-[0.65rem] font-extrabold uppercase tracking-wide text-muted-foreground">
                          UP:
                        </span>
                        {alt}
                      </span>
                    </span>
                  ) : null}
                </dd>
              </div>
            );
          })}
        </dl>
      )}
    </article>
  );
}

function NavButton({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex size-9 items-center justify-center rounded-full border border-border bg-card text-lg font-bold text-primary transition-colors hover:bg-secondary"
    >
      {children}
    </button>
  );
}

function Notice({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-card/70 p-6 text-center">
      <h2 className="text-xl">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
