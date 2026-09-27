// ==================================================
// SECTION -> ROUTE MAP
// ==================================================
//
// Single source of truth for the id used by DashboardMenu /
// DailyQuests quick-stats (e.g. "cards", "tutor") vs. the actual
// router path it should navigate to. Keeping this in one place
// avoids the mismatch that previously left "progress" un-routable.

export const SECTION_ROUTES = {
  dashboard: "/dashboard",
  subjects: "/subjects",
  notes: "/notes",
  tutor: "/tutor",
  cards: "/flashcards",
  quiz: "/quiz",
  practice: "/practice",
  progress: "/progress",
  profile: "/profile",
};

export function resolveSectionRoute(section) {
  return SECTION_ROUTES[section] || null;
}
