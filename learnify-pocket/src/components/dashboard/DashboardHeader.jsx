import React from "react";
import DashboardIcon from "./DashboardIcon";

export default function DashboardHeader({ onMenuOpen, onProfile }) {
  return (
    <header className="dashboard-header">
      <div className="dashboard-header__inner">
        <button
          type="button"
          className="dashboard-header__button dashboard-header__button--menu"
          onClick={onMenuOpen}
          aria-label="Open navigation menu"
        >
          <DashboardIcon name="menu" size={18} />
        </button>

        <span className="dashboard-header__logo">
          LEARNIFY<span>PKT</span>
        </span>

        <button
          type="button"
          className="dashboard-header__button dashboard-header__button--profile"
          onClick={onProfile}
          aria-label="Open profile"
        >
          <DashboardIcon name="user" size={18} />
        </button>
      </div>
    </header>
  );
}
