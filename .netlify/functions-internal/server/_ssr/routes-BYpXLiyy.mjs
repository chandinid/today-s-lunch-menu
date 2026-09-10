import { i as __toESM } from "../_runtime.mjs";
import { c as createServerFn, i as TSS_SERVER_FUNCTION } from "./createServerFn-CIHAFgYl.mjs";
import { a as require_react, i as require_jsx_runtime, r as useQueryClient, t as useQuery } from "../_libs/react+tanstack__react-query.mjs";
import { t as getServerFnById } from "../__23tanstack-start-server-fn-resolver-CV9VcQzk.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BYpXLiyy.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Sun/moon toggle that flips a "dark" class on <html>, persisted to localStorage. The initial
* theme itself is set synchronously by an inline script in __root.tsx (before React hydrates) so
* there's no flash of the wrong theme — this component just needs to read that starting state
* back out once it mounts, and let the person flip it from there. */
function ThemeToggle() {
	const [isDark, setIsDark] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setIsDark(document.documentElement.classList.contains("dark"));
	}, []);
	function toggle() {
		const next = !isDark;
		setIsDark(next);
		document.documentElement.classList.toggle("dark", next);
		try {
			localStorage.setItem("theme", next ? "dark" : "light");
		} catch {}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick: toggle,
		"aria-label": isDark ? "Switch to light mode" : "Switch to dark mode",
		className: "fixed right-4 top-4 z-40 flex size-10 items-center justify-center rounded-full border-2 border-border bg-card text-lg shadow-[var(--shadow-card)] hover:bg-secondary sm:right-6 sm:top-6",
		"data-tsd-source": "/src/components/ThemeToggle.tsx:26:5",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			"aria-hidden": "true",
			"data-tsd-source": "/src/components/ThemeToggle.tsx:32:7",
			children: isDark ? "☀️" : "🌙"
		})
	});
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
/**
* Returns the SFUSD Pre-K menu for a given month (defaults to the
* current month in San Francisco time).
*/
var fetchMonthMenu = createServerFn({ method: "GET" }).inputValidator((input) => input ?? {}).handler(createSsrRpc("aec80cabcf2ba6954277764dfe9a137bf70b4cc3beb2d3f117eb307fdf9dbe70"));
/**
* Splits a menu day's raw meal text (e.g. "Turkey & Cheese Sandwich Upon Request: Veggie
* Burger") into the main item and any "Upon Request" alternative. Shared by every place that
* renders a meal so the split logic (and what counts as "the alt") stays in one spot.
*/
function splitMealText(text) {
	const [main, ...alts] = text.split(/\s*Upon Request:\s*/i);
	return {
		main: main ?? text,
		alt: alts.length > 0 ? alts.join(" · ") : null
	};
}
/**
* Whether a day's entry actually has any meal to show. SFUSD's source PDF sometimes has a day
* in its calendar grid but with every cell (breakfast/lunch/snack) left blank — that comes back
* from the scraper as an entry object with all-null fields, not as a missing entry. Every place
* that renders a day needs to treat that the same as "no entry at all" (show the "no meal
* posted" state), rather than silently rendering an empty list.
*/
function hasAnyMeal(entry) {
	return Boolean(entry && (entry.breakfast || entry.lunch || entry.snack));
}
var LEAF$1 = "🍃";
var WEEKDAYS = [
	"Mon",
	"Tue",
	"Wed",
	"Thu",
	"Fri"
];
var MEALS$1 = [
	{
		key: "breakfast",
		label: "B",
		color: "text-accent"
	},
	{
		key: "lunch",
		label: "L",
		color: "text-primary"
	},
	{
		key: "snack",
		label: "S",
		color: "text-berry"
	}
];
/** Monday-Friday calendar of the month's meals. A 5-across grid on wider screens; a single
* scrolling column (no sideways scrolling) on phones, since squeezing 5 columns onto a phone
* screen was what made the calendar feel clunky to use there. */
function MenuCalendar({ monthIndex, year, month, days, todayDate, onSelectDay }) {
	const byDay = new Map(days.map((d) => [d.day, d]));
	const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
	const cells = [];
	const leading = (new Date(year, monthIndex, 1).getDay() + 6) % 7;
	for (let i = 0; i < Math.min(leading, 5); i += 1) cells.push(null);
	for (let d = 1; d <= daysInMonth; d += 1) {
		const wd = new Date(year, monthIndex, d).getDay();
		if (wd === 0 || wd === 6) continue;
		cells.push({
			day: d,
			entry: byDay.get(d)
		});
	}
	while (cells.length % 5 !== 0) cells.push(null);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-tsd-source": "/src/components/MenuCalendar.tsx:49:5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-1 gap-2 sm:hidden",
				"data-tsd-source": "/src/components/MenuCalendar.tsx:51:7",
				children: cells.map((cell, i) => cell ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarCell, {
					cell,
					weekday: WEEKDAYS[i % 5],
					month,
					todayDate,
					onSelectDay,
					"data-tsd-source": "/src/components/MenuCalendar.tsx:54:13"
				}, cell.day) : null)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "hidden overflow-x-auto sm:block",
				"data-tsd-source": "/src/components/MenuCalendar.tsx:67:7",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-[640px]",
					"data-tsd-source": "/src/components/MenuCalendar.tsx:68:9",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-5 gap-2 pb-2",
						"data-tsd-source": "/src/components/MenuCalendar.tsx:69:11",
						children: WEEKDAYS.map((w) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-center text-[0.7rem] font-extrabold uppercase tracking-widest text-muted-foreground",
							"data-tsd-source": "/src/components/MenuCalendar.tsx:71:15",
							children: w
						}, w))
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-5 gap-2",
						"data-tsd-source": "/src/components/MenuCalendar.tsx:79:11",
						children: cells.map((cell, i) => cell ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarCell, {
							cell,
							month,
							todayDate,
							onSelectDay,
							"data-tsd-source": "/src/components/MenuCalendar.tsx:82:17"
						}, cell.day) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "min-h-32 rounded-2xl",
							"data-tsd-source": "/src/components/MenuCalendar.tsx:90:17"
						}, `empty-${i}`))
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 text-center text-xs text-muted-foreground",
				"data-tsd-source": "/src/components/MenuCalendar.tsx:97:7",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-extrabold text-accent",
						"data-tsd-source": "/src/components/MenuCalendar.tsx:98:9",
						children: "B"
					}),
					" = Breakfast ·",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-extrabold text-primary",
						"data-tsd-source": "/src/components/MenuCalendar.tsx:99:9",
						children: "L"
					}),
					" = Lunch ·",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-extrabold text-berry",
						"data-tsd-source": "/src/components/MenuCalendar.tsx:100:9",
						children: "S"
					}),
					" = Snack ·",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-extrabold text-foreground",
						"data-tsd-source": "/src/components/MenuCalendar.tsx:101:9",
						children: "UP"
					}),
					" = Upon request (veggie alt) — tap a day for details"
				]
			})
		]
	});
}
/** One day's cell — shared by the mobile single-column layout and the desktop 5-across grid. */
function CalendarCell({ cell, weekday, month, todayDate, onSelectDay }) {
	const { day, entry } = cell;
	const holiday = entry?.lunch === "HOLIDAY" || entry?.breakfast === "HOLIDAY";
	const isToday = todayDate === day;
	const clickable = Boolean(onSelectDay) && hasAnyMeal(entry) && !holiday;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		"aria-label": `${month} ${day}`,
		disabled: !clickable,
		onClick: () => onSelectDay?.(day),
		className: `min-h-32 rounded-2xl border p-2.5 text-left transition-transform ${clickable ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]" : ""} ${isToday ? "border-2 border-primary bg-card shadow-[var(--shadow-lift)]" : holiday ? "border-dashed border-border bg-card/50" : "border-border bg-card/90"}`,
		"data-tsd-source": "/src/components/MenuCalendar.tsx:128:5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between",
			"data-tsd-source": "/src/components/MenuCalendar.tsx:143:7",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "flex items-baseline gap-1.5",
				"data-tsd-source": "/src/components/MenuCalendar.tsx:144:9",
				children: [weekday ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-[0.7rem] font-extrabold uppercase tracking-widest text-muted-foreground",
					"data-tsd-source": "/src/components/MenuCalendar.tsx:146:13",
					children: weekday
				}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-display text-2xl font-bold",
					"data-tsd-source": "/src/components/MenuCalendar.tsx:150:11",
					children: day
				})]
			}), isToday ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "-rotate-3 rounded-md border-2 border-white bg-primary px-2 py-0.5 text-[0.6rem] font-extrabold uppercase tracking-widest text-primary-foreground shadow-sm",
				"data-tsd-source": "/src/components/MenuCalendar.tsx:153:11",
				children: "Today"
			}) : null]
		}), holiday ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-xs font-bold text-berry",
			"data-tsd-source": "/src/components/MenuCalendar.tsx:159:9",
			children: "Holiday — no meals"
		}) : hasAnyMeal(entry) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-1.5 space-y-1.5 text-[0.72rem] leading-snug",
			"data-tsd-source": "/src/components/MenuCalendar.tsx:161:9",
			children: MEALS$1.map((meal) => {
				const value = entry[meal.key];
				if (!value) return null;
				const { main, alt } = splitMealText(value);
				const vegetarianMain = meal.key === "lunch" && entry.lunchVegetarian === true;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex gap-1.5",
					"data-tsd-source": "/src/components/MenuCalendar.tsx:168:15",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: `mt-px shrink-0 font-extrabold ${meal.color}`,
						"data-tsd-source": "/src/components/MenuCalendar.tsx:169:17",
						children: meal.label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "min-w-0",
						"data-tsd-source": "/src/components/MenuCalendar.tsx:170:17",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "line-clamp-2",
							"data-tsd-source": "/src/components/MenuCalendar.tsx:171:19",
							children: [vegetarianMain ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								"aria-hidden": "true",
								"data-tsd-source": "/src/components/MenuCalendar.tsx:172:39",
								children: [LEAF$1, " "]
							}) : null, main]
						}), alt ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "mt-1 flex items-start gap-1 rounded-md bg-secondary/70 px-1 py-0.5 font-extrabold text-foreground",
							"data-tsd-source": "/src/components/MenuCalendar.tsx:176:21",
							children: [meal.key === "lunch" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								"aria-hidden": "true",
								"data-tsd-source": "/src/components/MenuCalendar.tsx:177:47",
								children: LEAF$1
							}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "line-clamp-2",
								"data-tsd-source": "/src/components/MenuCalendar.tsx:178:23",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mr-1 text-[0.62rem] font-extrabold uppercase text-muted-foreground",
									"data-tsd-source": "/src/components/MenuCalendar.tsx:179:25",
									children: "UP:"
								}), alt]
							})]
						}) : null]
					})]
				}, meal.key);
			})
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-xs text-muted-foreground",
			"data-tsd-source": "/src/components/MenuCalendar.tsx:192:9",
			children: "No meals posted"
		})]
	});
}
var LEAF = "🍃";
var MEALS = [
	{
		key: "breakfast",
		allergensKey: "breakfastAllergens",
		label: "Breakfast",
		chip: "bg-accent text-accent-foreground",
		tilt: "rotate-2"
	},
	{
		key: "lunch",
		allergensKey: "lunchAllergens",
		label: "Lunch",
		chip: "bg-primary text-primary-foreground",
		tilt: "-rotate-2"
	},
	{
		key: "snack",
		allergensKey: "snackAllergens",
		label: "Snack",
		chip: "bg-berry text-berry-foreground",
		tilt: "-rotate-1"
	}
];
/** Full-detail popup for one day's meals — breakfast/lunch/snack, "Upon Request" alternatives,
* allergen tags, and a link to the source PDF. Shared by the month view and the week strip so a
* tapped day looks the same no matter where it was tapped from. */
function DayDetailModal({ entry, month, pdfUrl, onClose }) {
	const holiday = entry.lunch === "HOLIDAY" || entry.breakfast === "HOLIDAY";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		role: "dialog",
		"aria-modal": "true",
		"aria-label": `${month} ${entry.day} meals`,
		onClick: onClose,
		className: "fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-4 sm:items-center",
		"data-tsd-source": "/src/components/DayDetailModal.tsx:46:5",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			onClick: (e) => e.stopPropagation(),
			className: "w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-lift)] sm:p-8",
			"data-tsd-source": "/src/components/DayDetailModal.tsx:53:7",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between",
					"data-tsd-source": "/src/components/DayDetailModal.tsx:57:9",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "font-display text-2xl",
						"data-tsd-source": "/src/components/DayDetailModal.tsx:58:11",
						children: [
							month,
							" ",
							entry.day
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": "Close",
						onClick: onClose,
						className: "flex size-9 items-center justify-center rounded-full border border-border bg-background text-lg font-bold text-primary hover:bg-secondary",
						"data-tsd-source": "/src/components/DayDetailModal.tsx:61:11",
						children: "✕"
					})]
				}),
				holiday ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-sm font-bold text-berry",
					"data-tsd-source": "/src/components/DayDetailModal.tsx:72:11",
					children: "Holiday — no meals served"
				}) : !hasAnyMeal(entry) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-sm text-muted-foreground",
					"data-tsd-source": "/src/components/DayDetailModal.tsx:74:11",
					children: "No meal posted for this day yet."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
					className: "mt-4 space-y-4",
					"data-tsd-source": "/src/components/DayDetailModal.tsx:76:11",
					children: [MEALS.map((meal) => {
						const value = entry[meal.key];
						if (!value) return null;
						const { main, alt } = splitMealText(value);
						const allergens = entry[meal.allergensKey];
						const vegetarianMain = meal.key === "lunch" && entry.lunchVegetarian === true;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-tsd-source": "/src/components/DayDetailModal.tsx:84:17",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "flex items-center gap-2",
									"data-tsd-source": "/src/components/DayDetailModal.tsx:85:19",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: `rounded-md border-2 border-white px-3 py-1 text-xs font-extrabold uppercase tracking-widest shadow-sm ${meal.chip} ${meal.tilt}`,
										"data-tsd-source": "/src/components/DayDetailModal.tsx:86:21",
										children: meal.label
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
									className: "mt-2 flex items-start gap-1.5 font-display text-lg leading-snug",
									"data-tsd-source": "/src/components/DayDetailModal.tsx:92:19",
									children: [vegetarianMain ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										"aria-hidden": "true",
										"data-tsd-source": "/src/components/DayDetailModal.tsx:93:39",
										children: LEAF
									}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										"data-tsd-source": "/src/components/DayDetailModal.tsx:94:21",
										children: main
									})]
								}),
								alt ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-2 flex items-start gap-1.5 rounded-2xl bg-secondary/60 px-3 py-2",
									"data-tsd-source": "/src/components/DayDetailModal.tsx:97:21",
									children: [meal.key === "lunch" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										"aria-hidden": "true",
										className: "mt-0.5",
										"data-tsd-source": "/src/components/DayDetailModal.tsx:99:25",
										children: LEAF
									}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "font-display text-lg leading-snug",
										"data-tsd-source": "/src/components/DayDetailModal.tsx:103:23",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "mr-1.5 align-middle text-xs font-extrabold uppercase tracking-wide text-muted-foreground",
											"data-tsd-source": "/src/components/DayDetailModal.tsx:104:25",
											children: "Upon request:"
										}), alt]
									})]
								}) : null,
								allergens && allergens.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-2 flex flex-wrap items-center gap-1.5 text-xs",
									"data-tsd-source": "/src/components/DayDetailModal.tsx:112:21",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-bold uppercase tracking-wide text-muted-foreground",
										"data-tsd-source": "/src/components/DayDetailModal.tsx:113:23",
										children: "Contains:"
									}), allergens.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "rounded-md border border-border bg-secondary px-2 py-0.5 font-bold text-foreground",
										"data-tsd-source": "/src/components/DayDetailModal.tsx:117:25",
										children: a
									}, a))]
								}) : null
							]
						}, meal.key);
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "border-t border-border pt-3 text-xs text-muted-foreground",
						"data-tsd-source": "/src/components/DayDetailModal.tsx:129:13",
						children: "Allergen tags are matched from SFUSD's district allergen sheets where the item name lines up closely enough to be confident — they aren't official Pre-K records and won't cover every item. Always confirm with your child's teacher or the school for a confirmed allergen."
					})]
				}),
				pdfUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-6 border-t border-border pt-4 text-sm",
					"data-tsd-source": "/src/components/DayDetailModal.tsx:139:11",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						className: "font-bold text-primary underline underline-offset-2",
						href: pdfUrl,
						target: "_blank",
						rel: "noreferrer",
						"data-tsd-source": "/src/components/DayDetailModal.tsx:140:13",
						children: "View the full source PDF"
					})
				}) : null
			]
		})
	});
}
var MONTHS$1 = [
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
	"December"
];
var STALE_MS = 18e5;
var MEAL_ORDER = [
	{
		key: "lunch",
		label: "Lunch",
		chip: "bg-primary text-primary-foreground",
		tilt: "-rotate-2"
	},
	{
		key: "breakfast",
		label: "Breakfast",
		chip: "bg-accent text-accent-foreground",
		tilt: "rotate-2"
	},
	{
		key: "snack",
		label: "Snack",
		chip: "bg-berry text-berry-foreground",
		tilt: "-rotate-1"
	}
];
function isWeekday(d) {
	const wd = d.getDay();
	return wd !== 0 && wd !== 6;
}
function atMidnight(date) {
	const d = new Date(date);
	d.setHours(0, 0, 0, 0);
	return d;
}
function nextWeekday(from, direction) {
	const d = new Date(from);
	do
		d.setDate(d.getDate() + direction);
	while (!isWeekday(d));
	return d;
}
function sameDay(a, b) {
	return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function effectiveToday(today) {
	const midnight = atMidnight(today);
	return isWeekday(midnight) ? midnight : nextWeekday(midnight, 1);
}
/** A stacked carousel of "photo frame" day cards — today (or whichever day is selected) sits
* large and in front, with the day before and after peeking out from behind on either side.
* Tap a peeking card, or the arrows, to bring a different day forward; tap the front card to
* open its full detail (allergens + source PDF), same as the calendar below. */
function DayCarousel({ today }) {
	const anchor = (0, import_react.useMemo)(() => effectiveToday(today), [today]);
	const [selected, setSelected] = (0, import_react.useState)(() => anchor);
	const [showDetail, setShowDetail] = (0, import_react.useState)(false);
	const prevDate = (0, import_react.useMemo)(() => nextWeekday(selected, -1), [selected]);
	const nextDate = (0, import_react.useMemo)(() => nextWeekday(selected, 1), [selected]);
	const dates = (0, import_react.useMemo)(() => [
		prevDate,
		selected,
		nextDate
	], [
		prevDate,
		selected,
		nextDate
	]);
	const first = dates[0];
	const last = dates[2];
	const monthA = {
		month: MONTHS$1[first.getMonth()],
		year: first.getFullYear()
	};
	const monthB = {
		month: MONTHS$1[last.getMonth()],
		year: last.getFullYear()
	};
	const spansTwoMonths = monthA.month !== monthB.month || monthA.year !== monthB.year;
	const queryA = useQuery({
		queryKey: [
			"menu",
			monthA.month,
			monthA.year
		],
		queryFn: () => fetchMonthMenu({ data: monthA }),
		staleTime: STALE_MS
	});
	const queryB = useQuery({
		queryKey: [
			"menu",
			monthB.month,
			monthB.year
		],
		queryFn: () => fetchMonthMenu({ data: monthB }),
		staleTime: STALE_MS,
		enabled: spansTwoMonths
	});
	function menuFor(date) {
		const query = date.getMonth() === first.getMonth() && date.getFullYear() === first.getFullYear() ? queryA : queryB;
		if (!query.data?.ok) return {
			pending: query.isPending,
			entry: void 0,
			pdfUrl: void 0
		};
		return {
			pending: false,
			entry: query.data.menu.days.find((d) => d.day === date.getDate()),
			pdfUrl: query.data.menu.pdfUrl
		};
	}
	const selectedMenu = menuFor(selected);
	const isToday = sameDay(selected, anchor);
	const touchStartX = (0, import_react.useRef)(null);
	const SWIPE_THRESHOLD_PX = 40;
	function handleTouchStart(e) {
		touchStartX.current = e.touches[0]?.clientX ?? null;
	}
	function handleTouchEnd(e) {
		const startX = touchStartX.current;
		touchStartX.current = null;
		if (startX == null) return;
		const delta = (e.changedTouches[0]?.clientX ?? startX) - startX;
		if (delta > SWIPE_THRESHOLD_PX) setSelected(prevDate);
		else if (delta < -40) setSelected(nextDate);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"data-tsd-source": "/src/components/DayCarousel.tsx:136:5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative flex h-[26rem] touch-pan-y items-center justify-center sm:h-96",
				onTouchStart: handleTouchStart,
				onTouchEnd: handleTouchEnd,
				"data-tsd-source": "/src/components/DayCarousel.tsx:137:7",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CarouselArrow, {
						label: "Previous day",
						side: "left",
						onClick: () => setSelected(prevDate),
						"data-tsd-source": "/src/components/DayCarousel.tsx:142:9"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DayFrame, {
						date: prevDate,
						menu: menuFor(prevDate),
						today: anchor,
						layer: "behind",
						side: "left",
						onClick: () => setSelected(prevDate),
						"data-tsd-source": "/src/components/DayCarousel.tsx:144:9"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DayFrame, {
						date: nextDate,
						menu: menuFor(nextDate),
						today: anchor,
						layer: "behind",
						side: "right",
						onClick: () => setSelected(nextDate),
						"data-tsd-source": "/src/components/DayCarousel.tsx:152:9"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DayFrame, {
						date: selected,
						menu: selectedMenu,
						today: anchor,
						layer: "front",
						onClick: () => hasAnyMeal(selectedMenu.entry) && setShowDetail(true),
						"data-tsd-source": "/src/components/DayCarousel.tsx:160:9"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CarouselArrow, {
						label: "Next day",
						side: "right",
						onClick: () => setSelected(nextDate),
						"data-tsd-source": "/src/components/DayCarousel.tsx:168:9"
					})
				]
			}),
			!isToday ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 text-center",
				"data-tsd-source": "/src/components/DayCarousel.tsx:172:9",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setSelected(anchor),
					className: "rounded-full border border-border bg-card px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-primary hover:bg-secondary",
					"data-tsd-source": "/src/components/DayCarousel.tsx:173:11",
					children: "Back to today"
				})
			}) : null,
			showDetail && selectedMenu.entry ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DayDetailModal, {
				entry: selectedMenu.entry,
				month: MONTHS$1[selected.getMonth()],
				pdfUrl: selectedMenu.pdfUrl,
				onClose: () => setShowDetail(false),
				"data-tsd-source": "/src/components/DayCarousel.tsx:184:9"
			}) : null
		]
	});
}
function CarouselArrow({ label, side, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		"aria-label": label,
		onClick,
		className: `absolute top-1/2 z-30 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card text-lg font-bold text-primary shadow-[var(--shadow-card)] hover:bg-secondary ${side === "left" ? "left-0 sm:left-2" : "right-0 sm:right-2"}`,
		"data-tsd-source": "/src/components/DayCarousel.tsx:205:5",
		children: side === "left" ? "‹" : "›"
	});
}
function DayFrame({ date, menu, today, layer, side, onClick }) {
	const { pending, entry } = menu;
	const holiday = entry?.lunch === "HOLIDAY" || entry?.breakfast === "HOLIDAY";
	const todayFlag = sameDay(date, atMidnight(today));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick,
		className: `absolute w-64 shrink-0 rounded-[1.25rem] border-[6px] border-white bg-white p-3.5 text-left shadow-[var(--shadow-lift)] transition-transform duration-200 sm:w-72 ${layer === "front" ? "z-20 rotate-0 scale-100" : side === "left" ? "z-10 -translate-x-[62%] scale-[0.82] -rotate-6 opacity-90 sm:-translate-x-[68%]" : "z-10 translate-x-[62%] scale-[0.82] rotate-6 opacity-90 sm:translate-x-[68%]"} ${layer === "front" ? "cursor-pointer hover:-translate-y-1" : "cursor-pointer"}`,
		"data-tsd-source": "/src/components/DayCarousel.tsx:247:5",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: `rounded-2xl p-3.5 ${todayFlag ? "bg-secondary/70" : "bg-background"}`,
			"data-tsd-source": "/src/components/DayCarousel.tsx:254:7",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-baseline justify-between gap-2",
				"data-tsd-source": "/src/components/DayCarousel.tsx:255:9",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-sm font-extrabold uppercase tracking-widest text-muted-foreground",
					"data-tsd-source": "/src/components/DayCarousel.tsx:256:11",
					children: date.toLocaleDateString("en-US", {
						weekday: "short",
						month: "short",
						day: "numeric"
					})
				}), todayFlag ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "shrink-0 -rotate-3 rounded-md border-2 border-white bg-primary px-2 py-0.5 text-[0.65rem] font-extrabold uppercase tracking-widest text-primary-foreground shadow-sm",
					"data-tsd-source": "/src/components/DayCarousel.tsx:260:13",
					children: "Today"
				}) : null]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2.5 space-y-2.5",
				"data-tsd-source": "/src/components/DayCarousel.tsx:266:9",
				children: pending ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-11 animate-pulse rounded-xl bg-secondary/50",
					"data-tsd-source": "/src/components/DayCarousel.tsx:269:15"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-9 animate-pulse rounded-xl bg-secondary/40",
					"data-tsd-source": "/src/components/DayCarousel.tsx:270:15"
				})] }) : holiday ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-bold text-berry",
					"data-tsd-source": "/src/components/DayCarousel.tsx:273:13",
					children: "Holiday — no meals"
				}) : hasAnyMeal(entry) ? MEAL_ORDER.map((meal) => {
					const value = entry[meal.key];
					if (!value) return null;
					const { main, alt } = splitMealText(value);
					const vegetarianMain = meal.key === "lunch" && entry.lunchVegetarian === true;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-tsd-source": "/src/components/DayCarousel.tsx:281:17",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: `inline-block rounded-md border-2 border-white px-2 py-0.5 text-[0.65rem] font-extrabold uppercase tracking-widest shadow-sm ${meal.chip} ${meal.tilt}`,
								"data-tsd-source": "/src/components/DayCarousel.tsx:282:19",
								children: meal.label
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 flex items-start gap-1 text-base leading-snug",
								"data-tsd-source": "/src/components/DayCarousel.tsx:287:19",
								children: [vegetarianMain ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									"aria-hidden": "true",
									"data-tsd-source": "/src/components/DayCarousel.tsx:288:39",
									children: LEAF
								}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "line-clamp-2",
									"data-tsd-source": "/src/components/DayCarousel.tsx:289:21",
									children: main
								})]
							}),
							alt ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-0.5 flex items-start gap-1 rounded-md bg-secondary/70 px-1.5 py-0.5 text-xs font-bold text-foreground",
								"data-tsd-source": "/src/components/DayCarousel.tsx:292:21",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "shrink-0 text-[0.65rem] font-extrabold uppercase text-muted-foreground",
									"data-tsd-source": "/src/components/DayCarousel.tsx:293:23",
									children: "UP:"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "line-clamp-1",
									"data-tsd-source": "/src/components/DayCarousel.tsx:296:23",
									children: alt
								})]
							}) : null
						]
					}, meal.key);
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					"data-tsd-source": "/src/components/DayCarousel.tsx:303:13",
					children: "No meal posted"
				})
			})]
		})
	});
}
var MONTHS = [
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
	"December"
];
function sfToday() {
	return new Date((/* @__PURE__ */ new Date()).toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
}
function Index() {
	const today = (0, import_react.useMemo)(sfToday, []);
	const [view, setView] = (0, import_react.useState)("calendar");
	const [selectedDay, setSelectedDay] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (typeof window !== "undefined" && window.matchMedia("(max-width: 639px)").matches) setView("list");
	}, []);
	const [cursor, setCursor] = (0, import_react.useState)({
		month: today.getMonth(),
		year: today.getFullYear()
	});
	const year = cursor.year;
	const month = MONTHS[cursor.month];
	const isCurrentMonth = cursor.month === today.getMonth() && cursor.year === today.getFullYear();
	const { data, isPending } = useQuery({
		queryKey: [
			"menu",
			month,
			year
		],
		queryFn: () => fetchMonthMenu({ data: {
			month,
			year
		} }),
		staleTime: 18e5
	});
	const queryClient = useQueryClient();
	const adjacent = [{
		month: cursor.month === 0 ? 11 : cursor.month - 1,
		year: cursor.month === 0 ? cursor.year - 1 : cursor.year
	}, {
		month: cursor.month === 11 ? 0 : cursor.month + 1,
		year: cursor.month === 11 ? cursor.year + 1 : cursor.year
	}];
	(0, import_react.useEffect)(() => {
		for (const a of adjacent) {
			const am = MONTHS[a.month];
			queryClient.prefetchQuery({
				queryKey: [
					"menu",
					am,
					a.year
				],
				queryFn: () => fetchMonthMenu({ data: {
					month: am,
					year: a.year
				} }),
				staleTime: 18e5
			});
		}
	}, [cursor.month, cursor.year]);
	const days = data?.ok ? data.menu.days : [];
	const pdfUrl = data?.ok ? data.menu.pdfUrl : void 0;
	const selectedEntry = selectedDay != null ? days.find((d) => d.day === selectedDay) : void 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto w-full max-w-4xl px-5 pb-20 pt-10 sm:pt-16",
		"data-tsd-source": "/src/routes/index.tsx:110:5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeToggle, { "data-tsd-source": "/src/routes/index.tsx:111:7" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "reveal text-center",
				"data-tsd-source": "/src/routes/index.tsx:113:7",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-extrabold uppercase tracking-[0.22em] text-primary sm:text-base",
						"data-tsd-source": "/src/routes/index.tsx:114:9",
						children: "SFUSD Pre-K · Menu Tracker"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-2 text-4xl leading-tight sm:text-5xl",
						"data-tsd-source": "/src/routes/index.tsx:117:9",
						children: "What’s on the menu today!"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
						"aria-hidden": "true",
						viewBox: "0 0 220 14",
						className: "mx-auto mt-1.5 h-3 w-40 text-primary sm:w-52",
						"data-tsd-source": "/src/routes/index.tsx:118:9",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
							d: "M2 8c8-8 16 6 24-2s16 6 24-2 16 6 24-2 16 6 24-2 16 6 24-2 16 6 24-2",
							fill: "none",
							stroke: "currentColor",
							strokeWidth: "3",
							strokeLinecap: "round",
							"data-tsd-source": "/src/routes/index.tsx:123:11"
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "reveal mt-8 [animation-delay:120ms]",
				"data-tsd-source": "/src/routes/index.tsx:133:7",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DayCarousel, {
					today,
					"data-tsd-source": "/src/routes/index.tsx:134:9"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "reveal mt-12 [animation-delay:220ms]",
				"data-tsd-source": "/src/routes/index.tsx:137:7",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center justify-between gap-3",
						"data-tsd-source": "/src/routes/index.tsx:138:9",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-2xl",
							"data-tsd-source": "/src/routes/index.tsx:139:11",
							children: "The whole month"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							"data-tsd-source": "/src/routes/index.tsx:140:11",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mr-1 flex rounded-xl border-2 border-border bg-card p-1",
									"data-tsd-source": "/src/routes/index.tsx:141:13",
									children: ["calendar", "list"].map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setView(v),
										"aria-pressed": view === v,
										className: `rounded-lg px-3 py-1 text-xs font-extrabold uppercase tracking-widest transition-colors ${view === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-primary"}`,
										"data-tsd-source": "/src/routes/index.tsx:143:17",
										children: v
									}, v))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavButton, {
									label: "Previous month",
									onClick: () => setCursor((c) => ({
										month: c.month === 0 ? 11 : c.month - 1,
										year: c.month === 0 ? c.year - 1 : c.year
									})),
									"data-tsd-source": "/src/routes/index.tsx:158:13",
									children: "‹"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "min-w-28 text-center text-sm font-bold",
									"data-tsd-source": "/src/routes/index.tsx:169:13",
									children: [
										month,
										" ",
										year
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavButton, {
									label: "Next month",
									onClick: () => setCursor((c) => ({
										month: c.month === 11 ? 0 : c.month + 1,
										year: c.month === 11 ? c.year + 1 : c.year
									})),
									"data-tsd-source": "/src/routes/index.tsx:172:13",
									children: "›"
								})
							]
						})]
					}),
					isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-5 grid gap-3 sm:grid-cols-2",
						"data-tsd-source": "/src/routes/index.tsx:187:11",
						children: Array.from({ length: 6 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-28 animate-pulse rounded-2xl border border-border bg-card/70",
							"data-tsd-source": "/src/routes/index.tsx:189:15"
						}, i))
					}) : view === "calendar" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-5",
						"data-tsd-source": "/src/routes/index.tsx:196:11",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MenuCalendar, {
							monthIndex: cursor.month,
							year,
							month,
							days,
							todayDate: isCurrentMonth ? today.getDate() : null,
							onSelectDay: (d) => setSelectedDay(d),
							"data-tsd-source": "/src/routes/index.tsx:197:13"
						})
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-5 grid gap-3 sm:grid-cols-2",
						"data-tsd-source": "/src/routes/index.tsx:208:13",
						children: days.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DayCard, {
							entry: d,
							isToday: isCurrentMonth && d.day === today.getDate(),
							month,
							onClick: () => setSelectedDay(d.day),
							"data-tsd-source": "/src/routes/index.tsx:210:17"
						}, d.day))
					}), days.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-center text-xs text-muted-foreground",
						"data-tsd-source": "/src/routes/index.tsx:220:15",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-extrabold text-foreground",
							"data-tsd-source": "/src/routes/index.tsx:221:17",
							children: "UP"
						}), " = Upon request (vegetarian alternative)"]
					}) : null] }),
					!isPending && days.length === 0 && data?.ok ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Notice, {
						title: "Nothing posted yet",
						body: `SFUSD hasn't published the ${month} Pre-K menu.`,
						"data-tsd-source": "/src/routes/index.tsx:229:11"
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
				className: "mt-14 border-t border-border pt-6 text-center text-xs text-muted-foreground",
				"data-tsd-source": "/src/routes/index.tsx:236:7",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mb-2",
						"data-tsd-source": "/src/routes/index.tsx:237:9",
						children: [
							"This site tracks the",
							" ",
							pdfUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								className: "font-bold text-primary underline underline-offset-2",
								href: pdfUrl,
								target: "_blank",
								rel: "noreferrer",
								"data-tsd-source": "/src/routes/index.tsx:240:13",
								children: "Revolution Foods Pre-K Breakfast, Lunch & Snack"
							}) : "Revolution Foods Pre-K Breakfast, Lunch & Snack",
							" ",
							"menu — available at Pre-K schools situated on elementary school campuses and all standalone early education schools. Pre-K Snack is only provided to year-round, full-day Pre-K programs, per the CACFP."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						"data-tsd-source": "/src/routes/index.tsx:255:9",
						children: [
							"Menus are read automatically from the SFUSD",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								className: "font-bold text-primary underline underline-offset-2",
								href: "https://www.sfusd.edu/services/health-wellness/nutrition-school-meals/menus",
								target: "_blank",
								rel: "noreferrer",
								"data-tsd-source": "/src/routes/index.tsx:257:11",
								children: "nutrition & school meals page"
							}),
							pdfUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								" ",
								"·",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
									className: "font-bold text-primary underline underline-offset-2",
									href: pdfUrl,
									target: "_blank",
									rel: "noreferrer",
									"data-tsd-source": "/src/routes/index.tsx:269:15",
									children: [month, " source PDF"]
								})
							] }) : null,
							". Menus are subject to change."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 italic",
						"data-tsd-source": "/src/routes/index.tsx:281:9",
						children: "Not affiliated with or endorsed by SFUSD — just a tired preschool parent who got sick of squinting at a PDF every morning and made this instead."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						className: "mt-4 inline-block",
						href: "https://www.buymeacoffee.com/Chandinid",
						target: "_blank",
						rel: "noreferrer",
						"data-tsd-source": "/src/routes/index.tsx:285:9",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: "https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=&slug=Chandinid&button_colour=FF5F5F&font_colour=ffffff&font_family=Cookie&outline_colour=000000&coffee_colour=FFDD00",
							alt: "Buy me a coffee",
							className: "mx-auto h-auto",
							"data-tsd-source": "/src/routes/index.tsx:291:11"
						})
					})
				]
			}),
			selectedEntry ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DayDetailModal, {
				entry: selectedEntry,
				month,
				pdfUrl,
				onClose: () => setSelectedDay(null),
				"data-tsd-source": "/src/routes/index.tsx:300:9"
			}) : null
		]
	});
}
function DayCard({ entry, isToday, month, onClick }) {
	const holiday = entry.lunch === "HOLIDAY" || entry.breakfast === "HOLIDAY";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		role: "button",
		tabIndex: 0,
		onClick,
		onKeyDown: (e) => {
			if (e.key === "Enter" || e.key === " ") {
				e.preventDefault();
				onClick();
			}
		},
		className: `cursor-pointer rounded-2xl border p-4 transition-transform hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)] ${isToday ? "border-2 border-primary bg-card shadow-[var(--shadow-lift)]" : "border-border bg-card/90"}`,
		"data-tsd-source": "/src/routes/index.tsx:324:5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-baseline justify-between",
			"data-tsd-source": "/src/routes/index.tsx:340:7",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
				className: "text-lg",
				"data-tsd-source": "/src/routes/index.tsx:341:9",
				children: [
					month,
					" ",
					entry.day
				]
			}), isToday ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "-rotate-3 rounded-md border-2 border-white bg-primary px-2.5 py-1 text-[0.65rem] font-extrabold uppercase tracking-widest text-primary-foreground shadow-sm",
				"data-tsd-source": "/src/routes/index.tsx:345:11",
				children: "Today"
			}) : null]
		}), holiday ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-sm font-bold text-berry",
			"data-tsd-source": "/src/routes/index.tsx:351:9",
			children: "Holiday — no meals served"
		}) : !hasAnyMeal(entry) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-sm text-muted-foreground",
			"data-tsd-source": "/src/routes/index.tsx:353:9",
			children: "No meal posted"
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
			className: "mt-2 space-y-3 text-sm",
			"data-tsd-source": "/src/routes/index.tsx:355:9",
			children: MEALS.map((meal) => {
				const value = entry[meal.key];
				if (!value) return null;
				const { main, alt } = splitMealText(value);
				const vegetarianMain = meal.key === "lunch" && entry.lunchVegetarian === true;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					"data-tsd-source": "/src/routes/index.tsx:362:15",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "w-20 shrink-0 font-bold uppercase tracking-wide text-muted-foreground",
						"data-tsd-source": "/src/routes/index.tsx:363:17",
						children: meal.label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
						className: "flex-1",
						"data-tsd-source": "/src/routes/index.tsx:366:17",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "line-clamp-2",
							"data-tsd-source": "/src/routes/index.tsx:367:19",
							children: [vegetarianMain ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								"aria-hidden": "true",
								"data-tsd-source": "/src/routes/index.tsx:368:39",
								children: [LEAF, " "]
							}) : null, main]
						}), alt ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "mt-1.5 flex items-start gap-1.5 rounded-xl bg-secondary/60 px-2.5 py-1.5 font-bold text-foreground",
							"data-tsd-source": "/src/routes/index.tsx:372:21",
							children: [meal.key === "lunch" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								"aria-hidden": "true",
								"data-tsd-source": "/src/routes/index.tsx:373:47",
								children: LEAF
							}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								"data-tsd-source": "/src/routes/index.tsx:374:23",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mr-1 text-[0.65rem] font-extrabold uppercase tracking-wide text-muted-foreground",
									"data-tsd-source": "/src/routes/index.tsx:375:25",
									children: "UP:"
								}), alt]
							})]
						}) : null]
					})]
				}, meal.key);
			})
		})]
	});
}
function NavButton({ children, label, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		"aria-label": label,
		onClick,
		className: "flex size-9 items-center justify-center rounded-full border border-border bg-card text-lg font-bold text-primary transition-colors hover:bg-secondary",
		"data-tsd-source": "/src/routes/index.tsx:402:5",
		children
	});
}
function Notice({ title, body }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-3xl border border-dashed border-border bg-card/70 p-6 text-center",
		"data-tsd-source": "/src/routes/index.tsx:415:5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "text-xl",
			"data-tsd-source": "/src/routes/index.tsx:416:7",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-sm text-muted-foreground",
			"data-tsd-source": "/src/routes/index.tsx:417:7",
			children: body
		})]
	});
}
//#endregion
export { Index as component };
