import React from "react";
import DashboardIcon from "./DashboardIcon";

export default function QuestItem({ task, onToggle, onDelete }) {
  const handleDelete = (event) => {
    event.stopPropagation();
    onDelete(task.id);
  };

  return (
    <article className="quest-item">
      <button
        type="button"
        className="quest-item__main"
        onClick={() => onToggle(task.id)}
      >
        <span
          className={`quest-item__checkbox ${
            task.done ? "quest-item__checkbox--done" : ""
          }`}
        >
          {task.done && <DashboardIcon name="check" size={12} />}
        </span>

        <span
          className={`quest-item__title ${
            task.done ? "quest-item__title--done" : ""
          }`}
        >
          {task.title}
        </span>
      </button>

      <div className="quest-item__actions">
        <span className="quest-item__time">{task.time}</span>

        <button
          type="button"
          className="quest-item__delete"
          onClick={handleDelete}
          aria-label={`Delete ${task.title}`}
        >
          <DashboardIcon name="trash" size={14} />
        </button>
      </div>
    </article>
  );
}
