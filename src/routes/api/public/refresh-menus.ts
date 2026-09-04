import { createFileRoute } from "@tanstack/react-router";
import { prewarmMenus } from "@/lib/menu.server";

/**
 * Manual/backup trigger for the same pre-warm that Netlify's scheduled function
 * (netlify/functions/refresh-menus-cron.mts) now runs automatically every 4 hours.
 * Useful right after SFUSD posts a new month's PDF, if you don't want to wait for the
 * next scheduled run: POST https://sfusdmenu.com/api/public/refresh-menus
 *
 * A shared secret is expected in the X-Refresh-Token header to prevent abuse.
 */
export const Route = createFileRoute("/api/public/refresh-menus")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const expected = process.env["MENU_REFRESH_TOKEN"];
        if (expected) {
          const sent = request.headers.get("x-refresh-token");
          if (!sent || sent !== expected) {
            return new Response("Unauthorized", { status: 401 });
          }
        }
        try {
          const result = await prewarmMenus();
          return new Response(
            JSON.stringify({
              ok: true,
              warmed: result.warmed,
              skipped: result.skipped,
            }),
            { headers: { "Content-Type": "application/json" } },
          );
        } catch (error) {
          return new Response(JSON.stringify({ ok: false, error: String(error) }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
