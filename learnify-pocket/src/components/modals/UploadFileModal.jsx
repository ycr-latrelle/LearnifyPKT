import React, { useState } from "react";
import Modal from "../shared/Modal";
import DashboardIcon from "../dashboard/DashboardIcon";

export default function UploadFileModal({
  subjects = [],
  defaultSubjectId = null,
  onClose,
  onUpload,
}) {
  const [fileName, setFileName] = useState("");
  const [subjectId, setSubjectId] = useState(defaultSubjectId ?? "");
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) setFileName(file.name);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!fileName.trim()) {
      setError("Choose a file, or type a file name to simulate one.");
      return;
    }

    setIsProcessing(true);

    // Simulated delay — there is no AI/backend parsing endpoint wired up
    // yet, so this just generates placeholder study assets locally.
    await new Promise((resolve) => setTimeout(resolve, 500));

    onUpload({ fileName: fileName.trim(), subjectId: subjectId ? Number(subjectId) : null });
    setIsProcessing(false);
    onClose();
  };

  return (
    <Modal title="Upload Study Document" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <p className="tutor-banner" style={{ marginBottom: "0.875rem" }}>
          The AI parsing backend isn't connected yet, so this creates a placeholder
          note + quest from your file so you can see how the flow will work.
        </p>

        <div className="pixel-field">
          <label htmlFor="upload-file">File</label>
          <div className="pixel-file-input">
            <label className="pixel-file-drop" htmlFor="upload-file">
              <DashboardIcon name="fileUpload" size={22} />
              <span>{fileName || "Tap to choose a file"}</span>
            </label>
            <input
              id="upload-file"
              type="file"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </div>
        </div>

        {subjects.length > 0 && (
          <div className="pixel-field">
            <label htmlFor="upload-subject">Subject</label>
            <select
              id="upload-subject"
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
          <button type="submit" className="pixel-button pixel-button--blue" disabled={isProcessing}>
            {isProcessing ? "Processing..." : "Upload & Generate"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
