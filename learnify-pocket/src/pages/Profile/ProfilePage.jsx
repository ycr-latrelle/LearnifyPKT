import React, { useState } from "react";

import SectionShell from "../../components/shared/SectionShell";
import DashboardIcon from "../../components/dashboard/DashboardIcon";
import EditProfileModal from "../../components/modals/EditProfileModal";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [overrides, setOverrides] = useState(null);

  const name = overrides?.name || user?.name || user?.displayName || "Player";
  const email = user?.email || "—";
  const bio = overrides?.bio ?? user?.bio ?? "";
  const streak = user?.streak || 0;
  const targetDailyMinutes = overrides?.targetDailyMinutes ?? user?.targetDailyMinutes ?? 60;

  const handleSave = (updated) => {
    // No profile-update endpoint is wired up on the frontend for this
    // screen yet (AuthContext only exposes login/logout), so changes are
    // kept locally for this session.
    setOverrides((prev) => ({ ...prev, ...updated }));
  };

  return (
    <SectionShell activeTab="profile" title="Profile Settings">
      <div className="profile-card">
        <div className="profile-avatar">👾</div>
        <div style={{ minWidth: 0 }}>
          <h2 className="profile-card__name">{name}</h2>
          <p className="profile-card__email">{email}</p>
          {bio && <p className="profile-card__bio">{bio}</p>}
        </div>
      </div>

      <div className="profile-info-list">
        <div className="profile-info-row">
          <span className="profile-info-row__label">Streak</span>
          <span className="profile-info-row__value">🔥 {streak} days</span>
        </div>

        <div className="profile-info-row">
          <span className="profile-info-row__label">Daily Goal</span>
          <span className="profile-info-row__value">{targetDailyMinutes} MIN</span>
        </div>

        <div className="profile-info-row">
          <span className="profile-info-row__label">Dark Theme</span>
          <button
            type="button"
            onClick={toggleDarkMode}
            className="pixel-button pixel-button--ghost"
            style={{ padding: "0.375rem 0.75rem", fontSize: "0.5625rem" }}
          >
            {darkMode ? "ENABLED" : "DISABLED"}
          </button>
        </div>
      </div>

      <div className="profile-actions">
        <button type="button" className="pixel-button pixel-button--blue" onClick={() => setIsEditOpen(true)}>
          <DashboardIcon name="edit" size={12} /> Edit Profile
        </button>

        <button type="button" className="pixel-button pixel-button--rose" onClick={logout}>
          Exit Game / Log Out
        </button>
      </div>

      {isEditOpen && (
        <EditProfileModal
          profile={{ name, bio, targetDailyMinutes }}
          onClose={() => setIsEditOpen(false)}
          onSave={handleSave}
        />
      )}
    </SectionShell>
  );
}
