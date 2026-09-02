import { createServerFn } from "@tanstack/react-start";

export type { MenuDay, MonthMenu } from "./menu.server";

/**
 * Returns the SFUSD LunchMaster Pre-K menu for a given month (defaults to the
 * current month in San Francisco time).
 */
export const fetchMonthMenu = createServerFn({ method: "GET" })
  .inputValidator((input: { month?: string; year?: number } | undefined) => input ?? {})
  .handler(async ({ data }) => {
    const { MONTHS, getMonthMenu } = await import("./menu.server");

    const now = new Date(
      new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" }),
    );
    const month = data.month ?? MONTHS[now.getMonth()]!;
    const year = data.year ?? now.getFullYear();

    try {
      const menu = await getMonthMenu(month, year);
      return { ok: true as const, menu };
    } catch (error) {
      console.error("fetchMonthMenu failed", error);
      return {
        ok: false as const,
        month,
        year,
        error: error instanceof Error ? error.message : "Could not load the menu.",
      };
    }
  });
