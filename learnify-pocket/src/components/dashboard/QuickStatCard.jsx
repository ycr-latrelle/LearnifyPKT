import React from "react";

export default function QuickStatCard({ label, value, onClick }) {
  return (
    <button type="button" className="quick-stat-card" onClick={onClick}>
      <span className="quick-stat-card__label">{label}</span>

      <span className="quick-stat-card__value">{value}</span>
    </button>
  );
}
