import { prewarmMenus } from "../../src/lib/menu.server";

/**
 * Netlify Scheduled Function: pre-fetches and AI-parses the current and next month's Pre-K
 * menu into the shared Netlify Blobs cache (see src/lib/menu.server.ts) so visitors never hit
 * a cold parse themselves.
 *
 * This replaces the old Lovable-only setup, where an external scheduler had to be pointed at
 * a `/api/public/refresh-menus` HTTP endpoint by hand. Netlify runs this on its own — no
 * external cron, no shared secret to manage — every 4 hours.
 */
export default async () => {
  const result = await prewarmMenus();
  console.log("Pre-warmed menu cache", result);
};

export const config = {
  schedule: "0 */4 * * *",
};
