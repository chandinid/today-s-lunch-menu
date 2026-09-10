import { createFileRoute } from "@tanstack/react-router";
import { getStore } from "@netlify/blobs";
import { getMonthMenu } from "@/lib/menu.server";

/**
 * TEMPORARY debug route: forces a fresh (cache-bypassing) parse of the requested month using the
 * new position-based table reconstruction, so the fix can be verified against the live PDF before
 * trusting the real 6h-TTL cache to pick it up on its own. Remove once verified.
 * Usage: /api/public/debug-pdf?month=September&year=2026
 */
export const Route = createFileRoute("/api/public/debug-pdf")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        try {
          const url = new URL(request.url);
          const month = url.searchParams.get("month") || "September";
          const year = Number(url.searchParams.get("year") || "2026");

          try {
            const store = getStore({ name: "menu-cache", consistency: "strong" });
            await store.delete(`${month}-${year}`);
          } catch (error) {
            console.error("cache delete failed (non-fatal for this debug route)", error);
          }

          const menu = await getMonthMenu(month, year);
          return new Response(JSON.stringify({ ok: true, menu }), {
            headers: { "Content-Type": "application/json" },
          });
        } catch (error) {
          return new Response(
            JSON.stringify({
              ok: false,
              error: error instanceof Error ? error.message : String(error),
            }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});
