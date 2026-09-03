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

const MEALS = [
  { key: "breakfast", label: "Breakfast", chip: "bg-accent text-accent-foreground" },
  { key: "lunch", label: "Lunch", chip: "bg-primary text-primary-foreground" },
  { key: "snack", label: "Snack", chip: "bg-berry text-berry-foreground" },
] as const;

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

function Index() {
  const today = useMemo(sfToday, []);
  const [monthIndex, setMonthIndex] = useState(today.getMonth());
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [cursor, setCursor] = useState({ month: today.getMonth(), year: today.getFullYear() });
  const year = cursor.year;
  const month = MONTHS[cursor.month]!;
  const isCurrentMonth =
    cursor.month === today.getMonth() && cursor.year === today.getFullYear();

  const { data, isPending } = useQuery({
    queryKey: ["menu", month, year],
    queryFn: () => fetchMonthMenu({ data: { month, year } }),
    staleTime: 1000 * 60 * 30,
  });

  // Prefetch adjacent months so the prev/next arrows feel instant.
  const queryClient = useQueryClient();
  const adjacent = [
    { month: cursor.month === 0 ? 11 : cursor.month - 1, year: cursor.month === 0 ? cursor.year - 1 : cursor.year },
    { month: cursor.month === 11 ? 0 : cursor.month + 1, year: cursor.month === 11 ? cursor.year + 1 : cursor.year },
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
  const todayEntry = isCurrentMonth
    ? days.find((d) => d.day === today.getDate())
    : undefined;
  const pdfUrl = data?.ok ? data.menu.pdfUrl : undefined;

  const selectedEntry =
    selectedDay != null ? days.find((d) => d.day === selectedDay) : undefined;

  return (
    <main className="mx-auto w-full max-w-4xl px-5 pb-20 pt-10 sm:pt-16">
      <header className="text-center">
        <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-primary">
          SFUSD Pre-K · LunchMaster
        </p>
        <p className="mt-2 font-display text-3xl leading-tight text-foreground sm:text-4xl">
          {today.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
        <h1 className="mt-2 text-4xl leading-tight sm:text-5xl">What&rsquo;s for lunch?</h1>
      </header>

      <section className="mt-8">
        {isPending ? (
          <div className="grid gap-4">
            <div className="h-40 animate-pulse rounded-3xl border border-border bg-card/70" />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="h-32 animate-pulse rounded-3xl border border-border bg-card/70" />
              <div className="h-32 animate-pulse rounded-3xl border border-border bg-card/70" />
            </div>
          </div>
        ) : data && !data.ok ? (
          <Notice title="Menu unavailable" body={data.error} />
        ) : todayEntry ? (
          <div className="grid gap-4">
            <TodayLunchHero entry={todayEntry} pdfUrl={pdfUrl} />
            <div className="grid gap-4 sm:grid-cols-2">
              {MEALS.filter((m) => m.key !== "lunch").map((meal) => (
                <article
                  key={meal.key}
                  className="rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-card)]"
                >
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-widest ${meal.chip}`}
                  >
                    {meal.label}
                  </span>
                  <p className="mt-3 font-display text-xl leading-snug">
                    {todayEntry[meal.key] ?? "Not served today"}
                  </p>
                </article>
              ))}
            </div>
          </div>
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
              onSelectDay={(d) => setSelectedDay(d)}
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
                onClick={() => setSelectedDay(d.day)}
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

function TodayLunchHero({
  entry,
  pdfUrl,
}: {
  entry: MenuDay;
  pdfUrl: string | undefined;
}) {
  const lunch = entry.lunch;
  const holiday = lunch === "HOLIDAY";
  return (
    <article className="rounded-3xl border-2 border-primary bg-card p-6 shadow-[var(--shadow-lift)] sm:p-8">
      <span className="inline-block rounded-full bg-primary px-3 py-1 text-xs font-extrabold uppercase tracking-[0.22em] text-primary-foreground">
        Lunch
      </span>
      <p className="mt-4 font-display text-3xl leading-tight sm:text-4xl">
        {holiday ? "Holiday — no meals served" : (lunch ?? "Not served today")}
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
    </article>
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
          <span className="rounded-full bg-primary px-2.5 py-1 text-[0.65rem] font-extrabold uppercase tracking-widest text-primary-foreground">
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
                <dd className="line-clamp-2">{entry[meal.key]}</dd>
              </div>
            ) : null,
          )}
        </dl>
      )}
    </article>
  );
}

function DayDetailModal({
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
              const [main, ...alts] = value.split(/\s*Upon Request:\s*/i);
              return (
                <div key={meal.key}>
                  <dt className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-widest ${meal.chip}`}
                    >
                      {meal.label}
                    </span>
                  </dt>
                  <dd className="mt-2 font-display text-lg leading-snug">{main}</dd>
                  {alts.length > 0 ? (
                    <p className="mt-1 text-sm text-muted-foreground">
                      <span className="font-bold text-foreground">Upon request:</span>{" "}
                      {alts.join(" · ")}
                    </p>
                  ) : null}
                </div>
              );
            })}
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
