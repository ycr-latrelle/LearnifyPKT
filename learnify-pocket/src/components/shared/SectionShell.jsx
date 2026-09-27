import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardHeader from "../dashboard/DashboardHeader";
import DashboardMenu from "../dashboard/DashboardMenu";
import DashboardIcon from "../dashboard/DashboardIcon";
import { useAuth } from "../../context/AuthContext";
import { SECTION_ROUTES } from "../../utils/sectionNavigation";

import "../../styles/dashboard.css";
import "../../styles/sections.css";

export default function SectionShell({
  activeTab,
  title,
  subtitle,
  onBack,
  headerAction,
  children,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleNavigate = (section) => {
    const route = SECTION_ROUTES[section];
    if (route) navigate(route);
  };

  return (
    <main className="dashboard-screen">
      <DashboardHeader
        onMenuOpen={() => setIsMenuOpen(true)}
        onProfile={() => handleNavigate("profile")}
      />

      <DashboardMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        activeTab={activeTab}
        onNavigate={handleNavigate}
        onLogout={logout}
      />

      <section className="section-page">
        <div className="section-page__title-row">
          {onBack && (
            <button
              type="button"
              className="section-page__back"
              onClick={onBack}
              aria-label="Go back"
            >
              <DashboardIcon name="back" size={16} />
            </button>
          )}

          <div className="section-page__title-group">
            <h1 className="section-page__title">{title}</h1>
            {subtitle && <p className="section-page__subtitle">{subtitle}</p>}
          </div>

          {headerAction && (
            <div className="section-page__header-action">{headerAction}</div>
          )}
        </div>

        {children}
      </section>
    </main>
  );
}
