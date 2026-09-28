import React, { useState } from "react";
import Modal from "../shared/Modal";
import DashboardIcon from "../dashboard/DashboardIcon";

const ACCEPTED_EXTENSIONS = [
  ".md",
  ".docx",
  ".pdf",
  ".txt",
];

const ACCEPTED_FILE_TYPES = [
  ".md",
  ".docx",
  ".pdf",
  ".txt",
].join(",");

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export default function UploadFileModal({
  subjects = [],
  defaultSubjectId = null,
  onClose,
  onUpload,
}) {
  const [file, setFile] = useState(null);

  const [fileName, setFileName] = useState("");

  const [subjectId, setSubjectId] = useState(
    defaultSubjectId ? String(defaultSubjectId) : "",
  );

  const [instructions, setInstructions] = useState("");

  const [error, setError] = useState("");

  const [isProcessing, setIsProcessing] = useState(false);

  // ==================================================
  // FILE CHANGE
  // ==================================================

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];

    setError("");

    if (!selectedFile) {
      setFile(null);
      setFileName("");

      return;
    }

    const extension = selectedFile.name
      .substring(selectedFile.name.lastIndexOf("."))
      .toLowerCase();

    if (!ACCEPTED_EXTENSIONS.includes(extension)) {
      setFile(null);
      setFileName("");

      setError(
        "Unsupported file type. Use MD, DOCX, PDF, or TXT.",
      );

      event.target.value = "";

      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setFile(null);
      setFileName("");

      setError("The selected file cannot be larger than 10 MB.");

      event.target.value = "";

      return;
    }

    setFile(selectedFile);

    setFileName(selectedFile.name);
  };

  // ==================================================
  // SUBMIT
  // ==================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!file) {
      setError("Please choose a study file.");

      return;
    }

    if (!subjectId) {
      setError("Please select a subject.");

      return;
    }

    try {
      setIsProcessing(true);

      await onUpload({
        file,

        subjectId: String(subjectId),

        instructions: instructions.trim(),
      });

      onClose();
    } catch (error) {
      console.error("Failed to upload and generate study materials:", error);

      setError(
        error?.message ||
          "Failed to generate study materials. Please try again.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // ==================================================
  // UI
  // ==================================================

  return (
    <Modal
      title="Upload Study Document"
      onClose={isProcessing ? undefined : onClose}
    >
      <form onSubmit={handleSubmit}>
        <p
          className="tutor-banner"
          style={{
            marginBottom: "0.875rem",
          }}
        >
          Upload a study document and Learnify will generate notes, flashcards,
          quizzes, and practice exercises from its contents.
        </p>

        {/* ==========================================
            FILE
        ========================================== */}

        <div className="pixel-field">
          <label htmlFor="upload-file">Study File</label>

          <div className="pixel-file-input">
            <label className="pixel-file-drop" htmlFor="upload-file">
              <DashboardIcon name="fileUpload" size={22} />

              <span>{fileName || "Tap to choose a file"}</span>
            </label>

            <input
              id="upload-file"
              type="file"
              accept={ACCEPTED_FILE_TYPES}
              onChange={handleFileChange}
              disabled={isProcessing}
              style={{
                display: "none",
              }}
            />
          </div>

          <p
            className="pixel-card__meta"
            style={{
              marginTop: "0.4rem",
              marginBottom: 0,
            }}
          >
            Supported: MD, DOCX, PDF, TXT
          </p>

          <p
            className="pixel-card__meta"
            style={{
              marginTop: "0.2rem",
              marginBottom: 0,
            }}
          >
            Maximum file size: 10 MB
          </p>

          {file && (
            <p
              className="pixel-card__meta"
              style={{
                marginTop: "0.2rem",
                marginBottom: 0,
              }}
            >
              File size: {(file.size / 1024).toFixed(1)} KB
            </p>
          )}
        </div>

        {/* ==========================================
            SUBJECT
        ========================================== */}

        <div className="pixel-field">
          <label htmlFor="upload-subject">Subject</label>

          {subjects.length > 0 ? (
            <select
              id="upload-subject"
              className="pixel-select"
              value={subjectId}
              onChange={(event) => setSubjectId(event.target.value)}
              disabled={isProcessing}
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
              You need to create a subject before generating study materials.
            </p>
          )}
        </div>

        {/* ==========================================
            INSTRUCTIONS
        ========================================== */}

        <div className="pixel-field">
          <label htmlFor="upload-instructions">Instructions (Optional)</label>

          <textarea
            id="upload-instructions"
            className="pixel-textarea"
            placeholder="e.g. Focus on important definitions, formulas, and examples."
            value={instructions}
            onChange={(event) => setInstructions(event.target.value)}
            disabled={isProcessing}
            rows={4}
          />
        </div>

        {/* ==========================================
            ERROR
        ========================================== */}

        {error && <p className="form-error">{error}</p>}

        {/* ==========================================
            ACTIONS
        ========================================== */}

        <div className="form-actions">
          <button
            type="button"
            className="pixel-button pixel-button--ghost"
            onClick={onClose}
            disabled={isProcessing}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="pixel-button pixel-button--blue"
            disabled={isProcessing || !file || subjects.length === 0}
          >
            {isProcessing ? "Generating..." : "Upload & Generate"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
