import React, { useEffect, useState } from "react";
import Modal from "../shared/Modal";

export default function AddCardModal({
  subjects = [],
  defaultSubjectId = null,
  initialFront = "",
  initialBack = "",
  mode = "add",
  onClose,
  onCreate,
}) {
  const isEditMode = mode === "edit";

  const [front, setFront] = useState(initialFront);
  const [back, setBack] = useState(initialBack);

  const [subjectId, setSubjectId] = useState(
    defaultSubjectId ? String(defaultSubjectId) : "",
  );

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Keep modal state synchronized if the
  // selected flashcard changes.
  useEffect(() => {
    setFront(initialFront || "");
    setBack(initialBack || "");

    setSubjectId(defaultSubjectId ? String(defaultSubjectId) : "");

    setError("");
  }, [initialFront, initialBack, defaultSubjectId]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    // ------------------------------------------
    // Validate front
    // ------------------------------------------

    if (!front.trim()) {
      setError("The front of the card is required.");
      return;
    }

    // ------------------------------------------
    // Validate back
    // ------------------------------------------

    if (!back.trim()) {
      setError("The back of the card is required.");
      return;
    }

    // ------------------------------------------
    // Validate subject
    // ------------------------------------------

    if (!subjectId) {
      setError("Please select a subject.");
      return;
    }

    try {
      setSaving(true);

      await onCreate({
        front: front.trim(),
        back: back.trim(),
        subjectId: String(subjectId),
      });

      onClose();
    } catch (error) {
      console.error(
        isEditMode
          ? "Failed to update flashcard:"
          : "Failed to create flashcard:",
        error,
      );

      setError(
        error?.message ||
          (isEditMode
            ? "Failed to update flashcard. Please try again."
            : "Failed to create flashcard. Please try again."),
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={isEditMode ? "Edit Flashcard" : "Add Flashcard"}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit}>
        {/* ------------------------------------ */}
        {/* FRONT                                */}
        {/* ------------------------------------ */}

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
            disabled={saving}
          />
        </div>

        {/* ------------------------------------ */}
        {/* BACK                                 */}
        {/* ------------------------------------ */}

        <div className="pixel-field">
          <label htmlFor="card-back">Back (Answer)</label>

          <textarea
            id="card-back"
            className="pixel-textarea"
            style={{ minHeight: "3.5rem" }}
            placeholder="e.g. A way to describe algorithm growth rate."
            value={back}
            onChange={(event) => setBack(event.target.value)}
            disabled={saving}
          />
        </div>

        {/* ------------------------------------ */}
        {/* SUBJECT                              */}
        {/* ------------------------------------ */}

        <div className="pixel-field">
          <label htmlFor="card-subject">Subject</label>

          {subjects.length > 0 ? (
            <select
              id="card-subject"
              className="pixel-select"
              value={subjectId}
              onChange={(event) => setSubjectId(event.target.value)}
              disabled={saving}
            >
              <option value="">Select a subject</option>

              {subjects.map((subject) => (
                <option key={subject.id} value={String(subject.id)}>
                  {subject.name}
                </option>
              ))}
            </select>
          ) : (
            <p className="form-error">
              You need to create a subject before adding a flashcard.
            </p>
          )}
        </div>

        {/* ------------------------------------ */}
        {/* ERROR                                */}
        {/* ------------------------------------ */}

        {error && <p className="form-error">{error}</p>}

        {/* ------------------------------------ */}
        {/* ACTIONS                              */}
        {/* ------------------------------------ */}

        <div className="form-actions">
          <button
            type="button"
            className="pixel-button pixel-button--ghost"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="pixel-button pixel-button--blue"
            disabled={saving || subjects.length === 0}
          >
            {saving
              ? isEditMode
                ? "Updating..."
                : "Saving..."
              : isEditMode
                ? "Update Card"
                : "Save Card"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
