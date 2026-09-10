import { c as createServerFn, i as TSS_SERVER_FUNCTION } from "./createServerFn-CIHAFgYl.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/menu.functions-CCsU9RVs.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var fetchMonthMenu_createServerFn_handler = createServerRpc({
	id: "aec80cabcf2ba6954277764dfe9a137bf70b4cc3beb2d3f117eb307fdf9dbe70",
	name: "fetchMonthMenu",
	filename: "src/lib/menu.functions.ts"
}, (opts) => fetchMonthMenu.__executeServer(opts));
var fetchMonthMenu = createServerFn({ method: "GET" }).inputValidator((input) => input ?? {}).handler(fetchMonthMenu_createServerFn_handler, async ({ data }) => {
	const { MONTHS, getMonthMenu } = await import("./menu.server-83A6iZwI.mjs").then((n) => n.t);
	const now = new Date((/* @__PURE__ */ new Date()).toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
	const month = data.month ?? MONTHS[now.getMonth()];
	const year = data.year ?? now.getFullYear();
	try {
		return {
			ok: true,
			menu: await getMonthMenu(month, year)
		};
	} catch (error) {
		console.error("fetchMonthMenu failed", error);
		return {
			ok: false,
			month,
			year,
			error: error instanceof Error ? error.message : "Could not load the menu."
		};
	}
});
//#endregion
export { fetchMonthMenu_createServerFn_handler };
