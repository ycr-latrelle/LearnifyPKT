import React from "react";
import DashboardIcon from "./DashboardIcon";
import { useTheme } from "../../context/ThemeContext";

const MENU_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "dashboard" },
  { id: "subjects", label: "Subjects", icon: "subjects" },
  { id: "notes", label: "Notes", icon: "notes" },
  { id: "tutor", label: "AI Tutor", icon: "bot" },
  { id: "cards", label: "Flashcards", icon: "cards" },
  { id: "quiz", label: "Quiz Center", icon: "quiz" },
  { id: "practice", label: "Practice Lab", icon: "practice" },
  { id: "progress", label: "Progress Stats", icon: "progress" },
  { id: "profile", label: "Profile Settings", icon: "user" },
];

export default function DashboardMenu({
  isOpen,
  onClose,
  activeTab,
  onNavigate,
  onLogout,
}) {
  const { darkMode, toggleDarkMode } = useTheme();

  const handleNavigate = (id) => {
    onNavigate(id);
    onClose();
  };

  return (
    <div
      className={`dashboard-menu-overlay${isOpen ? " dashboard-menu-overlay--open" : ""}`}
    >
      <aside className="dashboard-menu" aria-label="Dashboard navigation">
        <div className="dashboard-menu__content">
          <div className="dashboard-menu__header">
            <div className="dashboard-menu__brand">
              <div className="dashboard-menu__avatar">👾</div>

              <span>Learnify</span>
            </div>

            <button
              type="button"
              className="dashboard-menu__close"
              onClick={onClose}
              aria-label="Close navigation menu"
            >
              <DashboardIcon name="close" size={20} />
            </button>
          </div>

          <nav className="dashboard-menu__navigation">
            {MENU_ITEMS.map((item) => (
              <button
                type="button"
                key={item.id}
                className={`dashboard-menu__item ${
                  activeTab === item.id ? "dashboard-menu__item--active" : ""
                }`}
                onClick={() => handleNavigate(item.id)}
              >
                <span className="dashboard-menu__item-content">
                  <DashboardIcon name={item.icon} size={16} />
                  {item.label}
                </span>
              </button>
            ))}
          </nav>
        </div>

        <div className="dashboard-menu__footer">
          <button
            type="button"
            className="dashboard-menu__theme-toggle"
            onClick={toggleDarkMode}
          >
            <span>{darkMode ? "☀️ LIGHT MODE" : "🌙 DARK MODE"}</span>
          </button>

          <button
            type="button"
            className="dashboard-menu__logout"
            onClick={onLogout}
          >
            LOG OUT
          </button>
        </div>
      </aside>

      <button
        type="button"
        className="dashboard-menu__backdrop"
        onClick={onClose}
        aria-label="Close navigation menu"
      />
    </div>
  );
}
