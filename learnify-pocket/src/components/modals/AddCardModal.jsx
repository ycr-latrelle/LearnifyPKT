import React, { useState } from "react";
import Modal from "../shared/Modal";

export default function AddCardModal({ subjects = [], defaultSubjectId = null, onClose, onCreate }) {
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [subjectId, setSubjectId] = useState(defaultSubjectId ?? "");
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!front.trim() || !back.trim()) {
      setError("Both the front and back of the card are required.");
      return;
    }

    onCreate({
      front: front.trim(),
      back: back.trim(),
      subjectId: subjectId ? Number(subjectId) : null,
    });
    onClose();
  };

  return (
    <Modal title="Add Flashcard" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="pixel-field">
          <label htmlFor="card-front">Front (Question)</label>
          <textarea
            id="card-front"
            className="pixel-textarea"
            style={{ minHeight: "3.5rem" }}
            placeholder="e.g. What is Big-O notation?"
            value={front}
            onChange={(event) => setFront(event.target.value)}
            autoFocus
          />
        </div>

        <div className="pixel-field">
          <label htmlFor="card-back">Back (Answer)</label>
          <textarea
            id="card-back"
            className="pixel-textarea"
            style={{ minHeight: "3.5rem" }}
            placeholder="e.g. A way to describe algorithm growth rate."
            value={back}
            onChange={(event) => setBack(event.target.value)}
          />
        </div>

        {subjects.length > 0 && (
          <div className="pixel-field">
            <label htmlFor="card-subject">Subject</label>
            <select
              id="card-subject"
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

        {error && <p className="form-error">{error}</p>}

        <div className="form-actions">
          <button type="button" className="pixel-button pixel-button--ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="pixel-button pixel-button--blue">
            Save Card
          </button>
        </div>
      </form>
    </Modal>
  );
}
