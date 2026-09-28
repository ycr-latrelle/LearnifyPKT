import React, { useState } from "react";
import Modal from "../shared/Modal";

export default function AddSubjectModal({ onClose, onCreate }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmed = name.trim();

    if (!trimmed) {
      setError("Subject name is required.");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      await onCreate({
        name: trimmed,
      });

      onClose();
    } catch (error) {
      console.error("Failed to create subject:", error);

      setError(error?.message || "Failed to create subject.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal title="Add Subject" onClose={isSaving ? undefined : onClose}>
      <form onSubmit={handleSubmit}>
        <div className="pixel-field">
          <label htmlFor="subject-name">Subject Name</label>

          <input
            id="subject-name"
            type="text"
            className="pixel-input"
            placeholder="e.g. Organic Chemistry"
            value={name}
            disabled={isSaving}
            onChange={(event) => {
              setName(event.target.value);

              if (error) {
                setError("");
              }
            }}
            autoFocus
          />
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="form-actions">
          <button
            type="button"
            className="pixel-button pixel-button--ghost"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="pixel-button pixel-button--blue"
            disabled={isSaving}
          >
            {isSaving ? "Creating..." : "Create Subject"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
