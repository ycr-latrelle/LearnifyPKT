import { useEffect, useMemo, useState } from "react";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ACCEPTED_EXTENSIONS = [
  ".md",
  ".doc",
  ".docx",
  ".pdf",
  ".txt",
  ".ppt",
  ".pptx",
];

const PROGRESS_STAGES = [
  {
    min: 0,
    max: 15,
    label: "UPLOADING FILE...",
  },
  {
    min: 15,
    max: 35,
    label: "EXTRACTING CONTENT...",
  },
  {
    min: 35,
    max: 60,
    label: "ANALYZING STUDY MATERIAL...",
  },
  {
    min: 60,
    max: 82,
    label: "GENERATING STUDY ASSETS...",
  },
  {
    min: 82,
    max: 100,
    label: "FINALIZING MATERIALS...",
  },
];

function getFileExtension(fileName) {
  const lastDot = fileName.lastIndexOf(".");

  if (lastDot === -1) {
    return "";
  }

  return fileName.slice(lastDot).toLowerCase();
}

function formatFileSize(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getProgressStage(progress) {
  const stage = PROGRESS_STAGES.find(
    (item) => progress >= item.min && progress < item.max,
  );

  return stage?.label || "FINALIZING MATERIALS...";
}

export default function UploadFileModal({
  subjects = [],
  defaultSubject = null,
  onClose,
  onUpload,
}) {
  const defaultSubjectId = defaultSubject?.id ?? subjects?.[0]?.id ?? "";

  const [selectedFile, setSelectedFile] = useState(null);

  const [selectedSubjectId, setSelectedSubjectId] = useState(
    String(defaultSubjectId || ""),
  );

  const [instructions, setInstructions] = useState("");

  const [error, setError] = useState("");

  const [isProcessing, setIsProcessing] = useState(false);

  const [progress, setProgress] = useState(0);

  const [statusText, setStatusText] = useState("PREPARING...");

  /*
       Keep the status label synchronized
       with the staged visual progress.
    */
  const computedStatusText = useMemo(
    () => getProgressStage(progress),
    [progress],
  );

  useEffect(() => {
    if (!isProcessing) {
      return undefined;
    }

    /*
           Start at a small visible percentage.
        */
    setProgress(8);
    setStatusText("UPLOADING FILE...");

    /*
           Simulated staged progress.

           The progress deliberately stops at
           90% while waiting for the real API
           response. This prevents showing
           "100%" before generation actually
           finishes.
        */
    const interval = window.setInterval(() => {
      setProgress((previous) => {
        if (previous < 15) {
          return Math.min(previous + 1.4, 15);
        }

        if (previous < 35) {
          return Math.min(previous + 0.9, 35);
        }

        if (previous < 60) {
          return Math.min(previous + 0.55, 60);
        }

        if (previous < 82) {
          return Math.min(previous + 0.3, 82);
        }

        if (previous < 90) {
          return Math.min(previous + 0.12, 90);
        }

        return previous;
      });
    }, 350);

    return () => {
      window.clearInterval(interval);
    };
  }, [isProcessing]);

  useEffect(() => {
    if (!isProcessing) {
      return;
    }

    setStatusText(computedStatusText);
  }, [computedStatusText, isProcessing]);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");

    const extension = getFileExtension(file.name);

    if (!ACCEPTED_EXTENSIONS.includes(extension)) {
      setSelectedFile(null);

      setError(
        "Unsupported file type. " +
          "Use MD, DOC, DOCX, PDF, TXT, PPT, or PPTX.",
      );

      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setSelectedFile(null);

      setError("File size must not exceed 10 MB.");

      return;
    }

    setSelectedFile(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isProcessing) {
      return;
    }

    setError("");

    if (!selectedFile) {
      setError("Please select a study file.");

      return;
    }

    if (!selectedSubjectId) {
      setError("Please select a subject.");

      return;
    }

    if (typeof onUpload !== "function") {
      setError("Upload handler is unavailable.");

      return;
    }

    setIsProcessing(true);
    setProgress(8);
    setStatusText("UPLOADING FILE...");

    try {
      await onUpload({
        file: selectedFile,
        subjectId: String(selectedSubjectId),
        instructions: instructions.trim(),
      });

      /*
               The actual request completed,
               so finish the progress bar.
            */
      setProgress(100);
      setStatusText("GENERATION COMPLETE!");

      /*
               Give the user a brief visual
               confirmation before closing.
            */
      await new Promise((resolve) => window.setTimeout(resolve, 500));

      onClose?.();
    } catch (uploadError) {
      console.error(
        "Failed to upload and generate study materials:",
        uploadError,
      );

      setIsProcessing(false);
      setProgress(0);
      setStatusText("GENERATION FAILED");

      setError(
        uploadError?.message ||
          "Failed to generate study materials. Please try again.",
      );
    }
  };

  return (
    <div className="pixel-modal-overlay">
      <button
        type="button"
        className="pixel-modal-backdrop"
        aria-label="Close upload modal"
        onClick={() => {
          if (!isProcessing) {
            onClose?.();
          }
        }}
      />

      <div
        className="pixel-modal pixel-modal--wide"
        role="dialog"
        aria-modal="true"
        aria-labelledby="upload-file-modal-title"
      >
        <div className="pixel-modal__header">
          <h2 id="upload-file-modal-title" className="pixel-modal__title">
            {isProcessing ? "ANALYZING FILE" : "UPLOAD STUDY FILE"}
          </h2>

          <button
            type="button"
            className="pixel-modal__close"
            aria-label="Close"
            disabled={isProcessing}
            onClick={() => onClose?.()}
          >
            ×
          </button>
        </div>

        <div className="pixel-modal__body">
          {!isProcessing ? (
            <form className="subject-edit-form" onSubmit={handleSubmit}>
              {/* --------------------------------------------------
                                File
                               -------------------------------------------------- */}
              <div className="pixel-field">
                <label>Study File</label>

                <div className="pixel-file-input">
                  <label className="pixel-file-drop">
                    <span>
                      {selectedFile ? "CHANGE FILE" : "CHOOSE STUDY FILE"}
                    </span>

                    <strong>
                      {selectedFile
                        ? selectedFile.name
                        : "MD / DOC / DOCX / PDF / TXT / PPT / PPTX"}
                    </strong>

                    {selectedFile && (
                      <small>{formatFileSize(selectedFile.size)}</small>
                    )}

                    <input
                      type="file"
                      accept={ACCEPTED_EXTENSIONS.join(",")}
                      onChange={handleFileChange}
                      hidden
                    />
                  </label>
                </div>
              </div>

              {/* --------------------------------------------------
                                Subject
                               -------------------------------------------------- */}
              <div className="pixel-field">
                <label htmlFor="upload-subject">Subject</label>

                <select
                  id="upload-subject"
                  className="pixel-select"
                  value={selectedSubjectId}
                  onChange={(event) => setSelectedSubjectId(event.target.value)}
                >
                  <option value="">SELECT SUBJECT</option>

                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name || subject.title || "Untitled Subject"}
                    </option>
                  ))}
                </select>
              </div>

              {/* --------------------------------------------------
                                Instructions
                               -------------------------------------------------- */}
              <div className="pixel-field">
                <label htmlFor="upload-instructions">Instructions</label>

                <textarea
                  id="upload-instructions"
                  className="pixel-textarea"
                  value={instructions}
                  onChange={(event) => setInstructions(event.target.value)}
                  placeholder="Optional instructions for the AI..."
                  maxLength={2000}
                />

                <div className="subject-edit-counter">
                  {instructions.length} / 2000
                </div>
              </div>

              {error && <div className="form-error">{error}</div>}

              {/* --------------------------------------------------
                                Actions
                               -------------------------------------------------- */}
              <div className="form-actions">
                <button
                  type="button"
                  className="pixel-button pixel-button--ghost"
                  onClick={() => onClose?.()}
                >
                  CANCEL
                </button>

                <button
                  type="submit"
                  className="pixel-button"
                  disabled={!selectedFile || !selectedSubjectId}
                >
                  GENERATE
                </button>
              </div>
            </form>
          ) : (
            /* ======================================================
                           GENERATION PROGRESS
                           ====================================================== */
            <div className="upload-generation-progress">
              <div className="upload-generation-progress__icon">
                <span className="upload-generation-progress__spinner">✦</span>
              </div>

              <div className="upload-generation-progress__header">
                <h3 className="upload-generation-progress__title">
                  {statusText}
                </h3>

                <span className="upload-generation-progress__percentage">
                  {Math.round(progress)}%
                </span>
              </div>

              <div
                className="upload-generation-progress__track"
                role="progressbar"
                aria-valuemin="0"
                aria-valuemax="100"
                aria-valuenow={Math.round(progress)}
                aria-label="Study material generation progress"
              >
                <div
                  className="upload-generation-progress__fill"
                  style={{
                    width: `${progress}%`,
                  }}
                />
              </div>

              <div className="upload-generation-progress__details">
                <span>{selectedFile?.name || "Study file"}</span>

                <span>{formatFileSize(selectedFile?.size || 0)}</span>
              </div>

              <div className="upload-generation-progress__steps">
                <div
                  className={
                    progress >= 8
                      ? "upload-generation-progress__step upload-generation-progress__step--active"
                      : "upload-generation-progress__step"
                  }
                >
                  <span>1</span>
                  <small>UPLOAD</small>
                </div>

                <div
                  className={
                    progress >= 15
                      ? "upload-generation-progress__step upload-generation-progress__step--active"
                      : "upload-generation-progress__step"
                  }
                >
                  <span>2</span>
                  <small>EXTRACT</small>
                </div>

                <div
                  className={
                    progress >= 35
                      ? "upload-generation-progress__step upload-generation-progress__step--active"
                      : "upload-generation-progress__step"
                  }
                >
                  <span>3</span>
                  <small>ANALYZE</small>
                </div>

                <div
                  className={
                    progress >= 60
                      ? "upload-generation-progress__step upload-generation-progress__step--active"
                      : "upload-generation-progress__step"
                  }
                >
                  <span>4</span>
                  <small>GENERATE</small>
                </div>

                <div
                  className={
                    progress >= 90
                      ? "upload-generation-progress__step upload-generation-progress__step--active"
                      : "upload-generation-progress__step"
                  }
                >
                  <span>5</span>
                  <small>FINISH</small>
                </div>
              </div>

              <p className="upload-generation-progress__message">
                Learnify Pocket is analyzing your material and generating your
                study resources.
              </p>

              <div className="upload-generation-progress__warning">
                Please keep this window open while generation is in progress.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
