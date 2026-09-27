import React, { useState } from "react";
import Modal from "../shared/Modal";

export default function AddSubjectModal({ onClose, onCreate }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = name.trim();

    if (!trimmed) {
      setError("Subject name is required.");
      return;
    }

    onCreate({ name: trimmed });
    onClose();
  };

  return (
    <Modal title="Add Subject" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="pixel-field">
          <label htmlFor="subject-name">Subject Name</label>
          <input
            id="subject-name"
            type="text"
            className="pixel-input"
            placeholder="e.g. Organic Chemistry"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              if (error) setError("");
            }}
            autoFocus
          />
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="form-actions">
          <button type="button" className="pixel-button pixel-button--ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="pixel-button pixel-button--blue">
            Create Subject
          </button>
        </div>
      </form>
    </Modal>
  );
}
