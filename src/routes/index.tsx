import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { fetchMonthMenu, type MenuDay } from "@/lib/menu.functions";
import { MenuCalendar } from "@/components/MenuCalendar";

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
  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" }),
  );
  return now;
}

const MEALS = [
  { key: "breakfast", label: "Breakfast" },
  { key: "lunch", label: "Lunch" },
  { key: "snack", label: "Snack" },
] as const;

function Index() {
  const today = useMemo(sfToday, []);
  const [monthIndex, setMonthIndex] = useState(today.getMonth());
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const year = today.getFullYear();
  const month = MONTHS[monthIndex]!;
  const isCurrentMonth = monthIndex === today.getMonth();

  const { data, isPending } = useQuery({
    queryKey: ["menu", month, year],
    queryFn: () => fetchMonthMenu({ data: { month, year } }),
    staleTime: 1000 * 60 * 30,
  });

  const days = data?.ok ? data.menu.days : [];
  const todayEntry = isCurrentMonth
    ? days.find((d) => d.day === today.getDate())
    : undefined;

  return (
    <main className="mx-auto w-full max-w-4xl px-5 pb-20 pt-10 sm:pt-16">
      <header className="text-center">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">
          SFUSD Pre-K · LunchMaster
        </p>
        <h1 className="mt-3 text-4xl leading-tight sm:text-5xl">What&rsquo;s for lunch?</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {today.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
      </header>

      <section className="mt-8">
        {isPending ? (
          <div className="grid gap-4 sm:grid-cols-3">
            {MEALS.map((m) => (
              <div
                key={m.key}
                className="h-36 animate-pulse rounded-3xl border border-border bg-card/70"
              />
            ))}
          </div>
        ) : data && !data.ok ? (
          <Notice title="Menu unavailable" body={data.error} />
        ) : todayEntry ? (
          <>
            <TodayHero
              entry={todayEntry}
              month={month}
              day={today.getDate()}
              pdfUrl={data?.ok ? data.menu.pdfUrl : undefined}
            />
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {MEALS.map((meal) => (
                <article
                  key={meal.key}
                  className="rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-card)]"
                >
                  <div className="flex items-center gap-2">
                    <span aria-hidden className="h-2 w-2 rounded-full bg-accent" />
                    <h2 className="text-sm font-bold uppercase tracking-widest text-primary">
                      {meal.label}
                    </h2>
                  </div>
                  <p className="mt-3 font-display text-xl leading-snug">
                    {todayEntry[meal.key] ?? "Not served today"}
                  </p>
                </article>
              ))}
            </div>
          </>
        ) : (
          <Notice
            title={isCurrentMonth ? "No meals today" : `Browsing ${month}`}
            body={
              isCurrentMonth
                ? "Looks like a weekend, holiday, or a non-school day. Check the calendar below."
                : "Scroll down for the full month."
            }
          />
        )}
      </section>

      <section className="mt-12">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl">The whole month</h2>
          <div className="flex items-center gap-2">
            <div className="mr-1 flex rounded-full border border-border bg-card p-1">
              {(["calendar", "list"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setView(v)}
                  aria-pressed={view === v}
                  className={`rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-widest transition-colors ${
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
              onClick={() => setMonthIndex((i) => (i + 11) % 12)}
            >
              ‹
            </NavButton>
            <span className="min-w-28 text-center text-sm font-bold">
              {month} {year}
            </span>
            <NavButton label="Next month" onClick={() => setMonthIndex((i) => (i + 1) % 12)}>
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
              monthIndex={monthIndex}
              year={year}
              month={month}
              days={days}
              todayDate={isCurrentMonth ? today.getDate() : null}
            />
          </div>
        ) : (
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {days.map((d) => (
              <DayCard
                key={d.day}
                entry={d}
                isToday={isCurrentMonth && d.day === today.getDate()}
                month={month}
              />
            ))}
          </div>
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
            nutrition &amp; school meals page
          </a>
          {data?.ok ? (
            <>
              {" "}
              ·{" "}
              <a
                className="font-bold text-primary underline underline-offset-2"
                href={data.menu.pdfUrl}
                target="_blank"
                rel="noreferrer"
              >
                {month} PDF
              </a>
            </>
          ) : null}
          . Menus are subject to change.
        </p>
      </footer>
    </main>
  );
}

function DayCard({
  entry,
  isToday,
  month,
}: {
  entry: MenuDay;
  isToday: boolean;
  month: string;
}) {
  const holiday = entry.lunch === "HOLIDAY" || entry.breakfast === "HOLIDAY";
  return (
    <article
      className={`rounded-2xl border p-4 transition-shadow ${
        isToday
          ? "border-accent bg-card shadow-[var(--shadow-lift)]"
          : "border-border bg-card/80"
      }`}
    >
      <div className="flex items-baseline justify-between">
        <h3 className="text-lg">
          {month} {entry.day}
        </h3>
        {isToday ? (
          <span className="rounded-full bg-accent px-2.5 py-1 text-[0.65rem] font-extrabold uppercase tracking-widest text-accent-foreground">
            Today
          </span>
        ) : null}
      </div>
      {holiday ? (
        <p className="mt-2 text-sm font-bold text-berry">Holiday — no meals served</p>
      ) : (
        <dl className="mt-2 space-y-1.5 text-sm">
          {MEALS.map((meal) =>
            entry[meal.key] ? (
              <div key={meal.key} className="flex gap-2">
                <dt className="w-20 shrink-0 font-bold uppercase tracking-wide text-muted-foreground">
                  {meal.label}
                </dt>
                <dd>{entry[meal.key]}</dd>
              </div>
            ) : null,
          )}
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

function TodayHero({
  entry,
  month,
  day,
  pdfUrl,
}: {
  entry: MenuDay;
  month: string;
  day: number;
  pdfUrl: string | undefined;
}) {
  const lunch = entry.lunch;
  const holiday = lunch === "HOLIDAY";
  const mealText = holiday
    ? "not served — holiday"
    : (lunch ?? "not served today");
  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-card)] sm:p-8">
      <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-primary">
        Lunch today
      </p>
      <p className="mt-3 font-display text-2xl leading-tight sm:text-3xl">
        Lunch today for {month} {day} is{" "}
        <span className="text-primary">{mealText}</span>.
      </p>
      {pdfUrl ? (
        <p className="mt-4 text-sm">
          <a
            className="font-bold text-primary underline underline-offset-2"
            href={pdfUrl}
            target="_blank"
            rel="noreferrer"
          >
            View the source menu (PDF)
          </a>
        </p>
      ) : null}
    </div>
  );
}
