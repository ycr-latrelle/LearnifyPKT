import React from "react";

const FILTERS = ["ALL", "ACTIVE", "DONE"];

export default function QuestFilters({ filter, onFilterChange }) {
  return (
    <div className="quest-filters">
      {FILTERS.map((item) => (
        <button
          key={item}
          type="button"
          className={`quest-filter ${
            filter === item ? "quest-filter--active" : ""
          }`}
          onClick={() => onFilterChange(item)}
        >
          {item}
        </button>
      ))}
    </div>
  );
}
