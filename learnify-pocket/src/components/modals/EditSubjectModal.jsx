import React, { useEffect, useState } from "react";
import Modal from "../shared/Modal";

const SUBJECT_COLORS = ["blue", "amber", "emerald", "purple", "rose"];

export default function EditSubjectModal({ subject, onClose, onUpdate }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("blue");

  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!subject) return;

    setName(subject.name || "");
    setDescription(subject.description || "");
    setColor(subject.color || "blue");
    setError("");
  }, [subject]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Subject name is required.");
      return;
    }

    if (trimmedName.length > 100) {
      setError("Subject name must be 100 characters or less.");
      return;
    }

    if (description.length > 1000) {
      setError("Description must be 1000 characters or less.");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      await onUpdate(subject.id, {
        name: trimmedName,
        description: description.trim() || null,
        icon: subject.icon || "subjects",
        color,
      });

      onClose();
    } catch (error) {
      console.error("Failed to update subject:", error);

      setError(error?.message || "Failed to update subject.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal title="Edit Subject" onClose={isSaving ? undefined : onClose}>
      <form className="subject-edit-form" onSubmit={handleSubmit}>
        <div className="pixel-field">
          <label htmlFor="edit-subject-name">Subject Name</label>

          <input
            id="edit-subject-name"
            type="text"
            className="pixel-input"
            value={name}
            maxLength={100}
            disabled={isSaving}
            onChange={(event) => {
              setName(event.target.value);

              if (error) {
                setError("");
              }
            }}
            autoFocus
          />

          <span className="subject-edit-counter">{name.length}/100</span>
        </div>

        <div className="pixel-field">
          <label htmlFor="edit-subject-description">Description</label>

          <textarea
            id="edit-subject-description"
            className="pixel-textarea"
            rows={5}
            maxLength={1000}
            value={description}
            disabled={isSaving}
            onChange={(event) => {
              setDescription(event.target.value);

              if (error) {
                setError("");
              }
            }}
            placeholder="Describe this subject..."
          />

          <span className="subject-edit-counter">
            {description.length}/1000
          </span>
        </div>

        <div className="pixel-field">
          <label htmlFor="edit-subject-color">Color</label>

          <select
            id="edit-subject-color"
            className="pixel-select"
            value={color}
            disabled={isSaving}
            onChange={(event) => setColor(event.target.value)}
          >
            {SUBJECT_COLORS.map((subjectColor) => (
              <option key={subjectColor} value={subjectColor}>
                {subjectColor.charAt(0).toUpperCase() + subjectColor.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}

        <div className="form-actions subject-edit-actions">
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
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
