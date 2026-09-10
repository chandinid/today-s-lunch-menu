//#region node_modules/.nitro/vite/services/ssr/assets/__23tanstack-start-server-fn-resolver-CV9VcQzk.js
var manifest = { "aec80cabcf2ba6954277764dfe9a137bf70b4cc3beb2d3f117eb307fdf9dbe70": {
	functionName: "fetchMonthMenu_createServerFn_handler",
	importer: () => import("./_ssr/menu.functions-CCsU9RVs.mjs")
} };
async function getServerFnById(id, access) {
	const serverFnInfo = manifest[id];
	if (!serverFnInfo) throw new Error("Server function info not found for " + id);
	const fnModule = serverFnInfo.module ?? await serverFnInfo.importer();
	if (!fnModule) throw new Error("Server function module not resolved for " + id);
	const action = fnModule[serverFnInfo.functionName];
	if (!action) throw new Error("Server function module export not resolved for serverFn ID: " + id);
	return action;
}
//#endregion
export { getServerFnById as t };
