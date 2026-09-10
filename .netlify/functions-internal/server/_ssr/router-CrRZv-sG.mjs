import { i as __toESM } from "../_runtime.mjs";
import { c as HeadContent, d as Outlet, f as lazyRouteComponent, g as useRouter, h as Link, m as createRootRouteWithContext, p as createFileRoute, s as Scripts, u as createRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as prewarmMenus } from "./menu.server-83A6iZwI.mjs";
import { a as require_react, i as require_jsx_runtime, n as QueryClientProvider } from "../_libs/react+tanstack__react-query.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-CrRZv-sG.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var styles_default = "/assets/styles-Caqd7pmc.css";
function reportLovableError(error, context = {}) {
	if (typeof window === "undefined") return;
	window.__lovableEvents?.captureException?.(error, {
		source: "react_error_boundary",
		route: window.location.pathname,
		...context
	}, {
		mechanism: "react_error_boundary",
		handled: false,
		severity: "error"
	});
	const message = error instanceof Response ? `Response ${error.status}${error.url ? ` at ${error.url}` : ""}` : error instanceof Error ? error.message : String(error);
	const stack = error instanceof Error ? error.stack : void 0;
	window.__lovableReportRuntimeError?.({
		message,
		...stack !== void 0 && { stack },
		filename: window.location.pathname
	});
}
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		"data-tsd-source": "/src/routes/__root.tsx:17:5",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			"data-tsd-source": "/src/routes/__root.tsx:18:7",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-7xl font-bold text-foreground",
					"data-tsd-source": "/src/routes/__root.tsx:19:9",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 text-xl font-semibold text-foreground",
					"data-tsd-source": "/src/routes/__root.tsx:20:9",
					children: "Page not found"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					"data-tsd-source": "/src/routes/__root.tsx:21:9",
					children: "The page you're looking for doesn't exist or has been moved."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					"data-tsd-source": "/src/routes/__root.tsx:24:9",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						"data-tsd-source": "/src/routes/__root.tsx:25:11",
						children: "Go home"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		reportLovableError(error, { boundary: "tanstack_root_error_component" });
	}, [error]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		"data-tsd-source": "/src/routes/__root.tsx:45:5",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			"data-tsd-source": "/src/routes/__root.tsx:46:7",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-semibold tracking-tight text-foreground",
					"data-tsd-source": "/src/routes/__root.tsx:47:9",
					children: "This page didn't load"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					"data-tsd-source": "/src/routes/__root.tsx:50:9",
					children: "Something went wrong on our end. You can try refreshing or head back home."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					"data-tsd-source": "/src/routes/__root.tsx:53:9",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						"data-tsd-source": "/src/routes/__root.tsx:54:11",
						children: "Try again"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
						"data-tsd-source": "/src/routes/__root.tsx:63:11",
						children: "Go home"
					})]
				})
			]
		})
	});
}
var Route$2 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "Pre-K Lunch Menu | SFUSD Elementary & Early Ed Schools" },
			{
				name: "description",
				content: "Today's SFUSD Pre-K breakfast, lunch, and snack for schools on elementary campuses and all standalone early education schools, read from the Revolution Foods Pre-K menu."
			},
			{
				name: "author",
				content: "SFUSD Pre-K Menu"
			},
			{
				property: "og:title",
				content: "Pre-K Lunch Menu | SFUSD Elementary & Early Ed Schools"
			},
			{
				property: "og:description",
				content: "Today's SFUSD Pre-K breakfast, lunch, and snack for schools on elementary campuses and all standalone early education schools, read from the Revolution Foods Pre-K menu."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			}
		],
		links: [
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Archivo+Black&family=Hind:wght@400;500;600;700&display=swap"
			},
			{
				rel: "icon",
				href: "/favicon.ico",
				type: "image/x-icon"
			}
		]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		"data-tsd-source": "/src/routes/__root.tsx:121:5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("head", {
			"data-tsd-source": "/src/routes/__root.tsx:122:7",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("script", {
				dangerouslySetInnerHTML: { __html: "(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})();" },
				"data-tsd-source": "/src/routes/__root.tsx:125:9"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, { "data-tsd-source": "/src/routes/__root.tsx:131:9" })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", {
			className: "doodle-bg",
			"data-tsd-source": "/src/routes/__root.tsx:133:7",
			children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, { "data-tsd-source": "/src/routes/__root.tsx:135:9" })]
		})]
	});
}
function RootComponent() {
	const { queryClient } = Route$2.useRouteContext();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryClientProvider, {
		client: queryClient,
		"data-tsd-source": "/src/routes/__root.tsx:145:5",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, { "data-tsd-source": "/src/routes/__root.tsx:147:7" })
	});
}
var $$splitComponentImporter = () => import("./routes-BYpXLiyy.mjs");
var Route$1 = createFileRoute("/")({
	head: () => ({ meta: [
		{ title: "SFUSD Pre-K Lunch Menu | Elementary & Early Ed Campuses" },
		{
			name: "description",
			content: "See what's for breakfast, lunch, and snack today at SFUSD Pre-K schools situated on elementary school campuses and all standalone early education schools, pulled straight from the Revolution Foods Pre-K menu."
		},
		{
			property: "og:title",
			content: "SFUSD Pre-K Lunch Menu | Elementary & Early Ed Campuses"
		},
		{
			property: "og:description",
			content: "Today's SFUSD Pre-K breakfast, lunch, and snack for schools on elementary campuses and all standalone early education schools — no more digging through the source PDF."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
/**
* Manual/backup trigger for the same pre-warm that Netlify's scheduled function
* (netlify/functions/refresh-menus-cron.mts) now runs automatically every 4 hours.
* Useful right after SFUSD posts a new month's PDF, if you don't want to wait for the
* next scheduled run: POST https://sfusdmenu.com/api/public/refresh-menus
*
* A shared secret is expected in the X-Refresh-Token header to prevent abuse.
*/
var Route = createFileRoute("/api/public/refresh-menus")({ server: { handlers: { POST: async ({ request }) => {
	const expected = process.env["MENU_REFRESH_TOKEN"];
	if (expected) {
		const sent = request.headers.get("x-refresh-token");
		if (!sent || sent !== expected) return new Response("Unauthorized", { status: 401 });
	}
	try {
		const result = await prewarmMenus();
		return new Response(JSON.stringify({
			ok: true,
			warmed: result.warmed,
			skipped: result.skipped
		}), { headers: { "Content-Type": "application/json" } });
	} catch (error) {
		return new Response(JSON.stringify({
			ok: false,
			error: String(error)
		}), {
			status: 500,
			headers: { "Content-Type": "application/json" }
		});
	}
} } } });
var rootRouteChildren = {
	IndexRoute: Route$1.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$2
	}),
	ApiPublicRefreshMenusRoute: Route.update({
		id: "/api/public/refresh-menus",
		path: "/api/public/refresh-menus",
		getParentRoute: () => Route$2
	})
};
var routeTree = Route$2._addFileChildren(rootRouteChildren)._addFileTypes();
var getRouter = () => {
	const queryClient = new QueryClient();
	return createRouter({
		routeTree,
		context: { queryClient },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { getRouter };
