import React, { useState } from "react";

import DashboardIcon from "./DashboardIcon";
import QuestFilters from "./QuestFilters";
import QuestForm from "./QuestForm";
import QuestItem from "./QuestItem";
import EmptyQuestState from "./EmptyQuestState";

export default function DailyQuests({
  tasks = [],
  onToggleTask = () => {},
  onDeleteTask = () => {},
  onAddTask = () => {},
}) {
  const [filter, setFilter] = useState("ALL");
  const [showAddInline, setShowAddInline] = useState(false);

  const completedCount = tasks.filter((task) => task.done).length;

  const completionPercent =
    tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const filteredTasks = tasks.filter((task) => {
    if (filter === "ACTIVE") {
      return !task.done;
    }

    if (filter === "DONE") {
      return task.done;
    }

    return true;
  });

  const handleAddToggle = () => {
    setShowAddInline((current) => !current);
  };

  const handleCancelForm = () => {
    setShowAddInline(false);
  };

  return (
    <section className="daily-quests">
      <div className="daily-quests__header">
        <div className="daily-quests__title-group">
          <span className="daily-quests__title">
            DAILY QUESTS ({completedCount}/{tasks.length})
          </span>

          <span className="daily-quests__percentage">{completionPercent}%</span>
        </div>

        <button
          type="button"
          className="daily-quests__add-button"
          onClick={handleAddToggle}
        >
          <DashboardIcon name="plus" size={12} />

          {showAddInline ? "CANCEL" : "ADD QUEST"}
        </button>
      </div>

      <QuestFilters filter={filter} onFilterChange={setFilter} />

      {showAddInline && (
        <QuestForm onAddTask={onAddTask} onCancel={handleCancelForm} />
      )}

      {filteredTasks.length > 0 ? (
        <div className="daily-quests__list">
          {filteredTasks.map((task) => (
            <QuestItem
              key={task.id}
              task={task}
              onToggle={onToggleTask}
              onDelete={onDeleteTask}
            />
          ))}
        </div>
      ) : (
        <EmptyQuestState />
      )}
    </section>
  );
}
