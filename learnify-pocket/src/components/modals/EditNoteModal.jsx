import React, { useEffect, useState } from "react";
import Modal from "../shared/Modal";

export default function EditNoteModal({
  note,
  subjects = [],
  onClose,
  onUpdate,
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!note) {
      return;
    }

    setTitle(note.title ?? "");
    setContent(note.content ?? "");
    setError("");
  }, [note]);

  const subjectName =
    subjects.find((subject) => String(subject.id) === String(note?.subjectId))
      ?.name ?? "Unknown Subject";

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setError("");

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle) {
      setError("Title is required.");
      return;
    }

    if (!trimmedContent) {
      setError("Content is required.");
      return;
    }

    try {
      setIsSubmitting(true);

      await onUpdate(note.id, {
        title: trimmedTitle,
        content: trimmedContent,
      });

      onClose();
    } catch (err) {
      console.error("Failed to update note:", err);

      setError(err?.message || "Failed to update the note. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal title="Edit Note" onClose={isSubmitting ? undefined : onClose}>
      <form onSubmit={handleSubmit}>
        {/* Title */}
        <div className="pixel-field">
          <label htmlFor="edit-note-title">Title</label>

          <input
            id="edit-note-title"
            type="text"
            className="pixel-input"
            placeholder="e.g. Chapter 4 Summary"
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);

              if (error) {
                setError("");
              }
            }}
            disabled={isSubmitting}
            autoFocus
          />
        </div>

        {/* Subject */}
        <div className="pixel-field">
          <label htmlFor="edit-note-subject">Subject</label>

          <input
            id="edit-note-subject"
            type="text"
            className="pixel-input"
            value={subjectName}
            disabled
            readOnly
          />

          <small>
            The subject cannot be changed after the note is created.
          </small>
        </div>

        {/* Content */}
        <div className="pixel-field">
          <label htmlFor="edit-note-content">Content</label>

          <textarea
            id="edit-note-content"
            className="pixel-textarea"
            placeholder="Write your notes here..."
            value={content}
            onChange={(event) => {
              setContent(event.target.value);

              if (error) {
                setError("");
              }
            }}
            disabled={isSubmitting}
          />
        </div>

        {/* Error */}
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="form-actions">
          <button
            type="button"
            className="pixel-button pixel-button--ghost"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="pixel-button pixel-button--blue"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
