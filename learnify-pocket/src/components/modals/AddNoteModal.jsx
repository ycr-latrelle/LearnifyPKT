import React, { useState } from "react";
import Modal from "../shared/Modal";

export default function AddNoteModal({ subjects = [], defaultSubjectId = null, onClose, onCreate }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [subjectId, setSubjectId] = useState(defaultSubjectId ?? "");
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!title.trim() || !content.trim()) {
      setError("Title and content are both required.");
      return;
    }

    onCreate({
      title: title.trim(),
      content: content.trim(),
      subjectId: subjectId ? Number(subjectId) : null,
    });
    onClose();
  };

  return (
    <Modal title="Add Note" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="pixel-field">
          <label htmlFor="note-title">Title</label>
          <input
            id="note-title"
            type="text"
            className="pixel-input"
            placeholder="e.g. Chapter 4 Summary"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            autoFocus
          />
        </div>

        {subjects.length > 0 && (
          <div className="pixel-field">
            <label htmlFor="note-subject">Subject</label>
            <select
              id="note-subject"
              className="pixel-select"
              value={subjectId}
              onChange={(event) => setSubjectId(event.target.value)}
            >
              <option value="">No subject</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="pixel-field">
          <label htmlFor="note-content">Content</label>
          <textarea
            id="note-content"
            className="pixel-textarea"
            placeholder="Write your notes here..."
            value={content}
            onChange={(event) => setContent(event.target.value)}
          />
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="form-actions">
          <button type="button" className="pixel-button pixel-button--ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="pixel-button pixel-button--blue">
            Save Note
          </button>
        </div>
      </form>
    </Modal>
  );
}
