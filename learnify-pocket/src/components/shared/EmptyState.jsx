import React from "react";

export default function EmptyState({ message, actionLabel, onAction }) {
  return (
    <div className="empty-quest-state section-empty-state">
      <p>{message}</p>

      {actionLabel && onAction && (
        <button type="button" className="pixel-button pixel-button--blue" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
