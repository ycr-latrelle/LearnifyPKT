import React, { useState } from "react";

export default function QuestForm({ onAddTask, onCancel }) {
  const [title, setTitle] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      return;
    }

    onAddTask(trimmedTitle);

    setTitle("");
    onCancel();
  };

  return (
    <form className="quest-form" onSubmit={handleSubmit}>
      <input
        type="text"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Quest title..."
        className="quest-form__input"
        autoFocus
      />

      <button type="submit" className="quest-form__save">
        SAVE
      </button>
    </form>
  );
}
