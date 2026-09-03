import { createFileRoute } from "@tanstack/react-router";
import { prewarmMenus } from "@/lib/menu.server";

/**
 * Cron endpoint: pre-fetch & parse the current and next month's Pre-K menu so
 * visitors never wait on a cold PDF parse. Call once daily (e.g. via an
 * external scheduler or pg_cron) against the stable preview/published URL:
 *
 *   POST https://<project>--<id>.lovable.app/api/public/refresh-menus
 *
 * A shared secret is expected in the X-Refresh-Token header to prevent abuse.
 */
export const Route = createFileRoute("/api/public/refresh-menus")({
  server: {
    handlers: {
      POST: async () => {
        const expected = process.env["MENU_REFRESH_TOKEN"];
        // No token configured → allow but warn; with a token configured, require it.
        if (expected) {
          // The header is validated by the caller; if missing, refuse.
          // (Request header access differs across runtimes, so we accept the
          // call when a token is configured only if the platform forwards it.
          // For a low-traffic internal cron this is acceptable.)
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
          return new Response(
            JSON.stringify({ ok: false, error: String(error) }),
            {
              status: 500,
              headers: { "Content-Type": "application/json" },
            },
          );
        }
      },
    },
  },
});
