import React from "react";

export default function PlayerProfileCard({ userProfile = {}, onAskTutor }) {
  const name = userProfile?.name || "PLAYER";

  const firstName = name.split(" ")[0] || "PLAYER";

  const streak = userProfile?.streak || 0;

  const studyTimeMinutes = userProfile?.studyTimeMinutes || 0;

  const targetDailyMinutes = userProfile?.targetDailyMinutes || 0;

  const progress =
    targetDailyMinutes > 0
      ? Math.min(100, (studyTimeMinutes / targetDailyMinutes) * 100)
      : 0;

  return (
    <section className="player-profile-card">
      <div className="player-profile-card__top">
        <div>
          <span className="player-profile-card__badge">PLAYER 1</span>

          <h1 className="player-profile-card__title">LVL UP, {firstName} 👾</h1>
        </div>

        <span className="player-profile-card__streak">🔥 {streak} STREAK</span>
      </div>

      <div className="player-profile-card__progress-section">
        <div className="player-profile-card__progress-header">
          <span>DAILY EXP GOAL</span>

          <span>
            {studyTimeMinutes} / {targetDailyMinutes} MIN
          </span>
        </div>

        <div className="player-profile-card__progress-track">
          <div
            className="player-profile-card__progress-fill"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      </div>

      <div className="player-profile-card__footer">
        <span className="player-profile-card__prompt">
          READY FOR NEXT TASK?
        </span>

        <button
          type="button"
          className="pixel-button pixel-button--blue"
          onClick={onAskTutor}
        >
          ASK TUTOR →
        </button>
      </div>
    </section>
  );
}
