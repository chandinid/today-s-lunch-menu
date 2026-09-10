import { createFileRoute } from "@tanstack/react-router";
import { extractText, getDocumentProxy } from "unpdf";
import { findPreKMenuFileId } from "@/lib/menu.server";

/**
 * TEMPORARY debug route: dumps the raw per-page text unpdf extracts from the current Pre-K
 * menu PDF, bypassing the cache and the AI parse entirely. SFUSD appears to be actively editing
 * this file right now, so this is being used to check the live content directly. Remove once
 * the investigation is done.
 */
export const Route = createFileRoute("/api/public/debug-pdf")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        try {
          const url = new URL(request.url);
          const override = url.searchParams.get("fileId");
          const fileId = override || (await findPreKMenuFileId());
          if (!fileId) {
            return new Response(JSON.stringify({ ok: false, error: "No fileId found" }), {
              status: 404,
              headers: { "Content-Type": "application/json" },
            });
          }
          const bust = Date.now();
          const res = await fetch(
            `https://drive.google.com/uc?export=download&id=${fileId}&_=${bust}`,
            {
              headers: {
                "user-agent": "Mozilla/5.0 (compatible; SchoolMenuBot/1.0)",
                "cache-control": "no-cache",
                pragma: "no-cache",
              },
              cache: "no-store",
            },
          );
          if (!res.ok) {
            return new Response(
              JSON.stringify({ ok: false, error: `download failed ${res.status}` }),
              { status: 500, headers: { "Content-Type": "application/json" } },
            );
          }
          const SAFE_HEADERS = ["last-modified", "etag", "cache-control", "content-length", "date"];
          const responseHeaders = Object.fromEntries(
            SAFE_HEADERS.map((h) => [h, res.headers.get(h)]),
          );
          const buf = new Uint8Array(await res.arrayBuffer());
          const doc = await getDocumentProxy(buf);
          const { text } = await extractText(doc, { mergePages: false });
          const pages = Array.isArray(text) ? text : [text];
          return new Response(
            JSON.stringify({
              ok: true,
              fileId,
              pageCount: pages.length,
              byteLength: buf.byteLength,
              responseHeaders,
              pages,
            }),
            {
              headers: { "Content-Type": "application/json" },
            },
          );
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
