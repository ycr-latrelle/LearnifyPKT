import React, { useEffect } from "react";
import DashboardIcon from "../dashboard/DashboardIcon";

export default function Modal({ title, onClose, children, wide = false }) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="pixel-modal-overlay" role="dialog" aria-modal="true" aria-label={title}>
      <button
        type="button"
        className="pixel-modal-backdrop"
        onClick={onClose}
        aria-label="Close dialog"
      />

      <div className={`pixel-modal ${wide ? "pixel-modal--wide" : ""}`}>
        <div className="pixel-modal__header">
          <h2 className="pixel-modal__title">{title}</h2>

          <button
            type="button"
            className="pixel-modal__close"
            onClick={onClose}
            aria-label="Close"
          >
            <DashboardIcon name="x" size={16} />
          </button>
        </div>

        <div className="pixel-modal__body">{children}</div>
      </div>
    </div>
  );
}
