# Roadmap

- [x] Pull SFUSD monthly PreK menu (LunchMaster PreK Breakfast, Lunch & Snack) from the SFUSD menus page + Drive PDF
- [x] Parse the monthly PDF into per-day breakfast / lunch / snack
- [x] Show today's menu on the home page, with the rest of the month browsable
- [x] Calendar view + list toggle, holidays flagged, source/PDF link, "Lunch today for {month} {day} is …" hero, bigger day numbers
- [x] Redesign with exciting TK-Lunch themed colors and design (Berry Pop palette, Archivo Black + Hind, hero-grid)
- [x] Remove the "Lunch today" hero box; make the date above "What's for lunch?" bigger
- [x] Auto-download & parse next month's LunchMaster PDF as it comes out (no manual refresh) — cron/pre-warm endpoint + adjacent-month prefetch
- [x] Click a meal in the calendar to show full details (meal wording + "Upon Request" alternatives + source link)
- [x] Pull allergens from the shared Drive folder's PDFs, matched by item name to our Pre-K menu
      items (SFUSD has no Pre-K-specific allergen sheet yet — Chandini is working with the
      district on that — so breakfast/lunch allergens come from the K-12 sheet and only show
      when the item name matches closely enough to be confident; the period folder's file IDs
      are hardcoded in src/lib/allergens.server.ts and need manual updating each time SFUSD
      publishes a new period, or once a Pre-K-specific / auto-discoverable source exists)
- [ ] Pull nutrition (calories/carbs) data — same shared Drive folder has reference PDFs but
      they aren't per-item, so this needs a different approach than the allergen matching
- [x] Change hero heading to "What's on the menu today!"
- [x] Auto-pick the current month's PDF each month
