import React from "react";
import DashboardIcon from "./DashboardIcon";

const StudyAssetsBanner = ({ onOpenUpload = () => {} }) => {
  return (
    <section className="study-assets-banner">
      <div className="study-assets-content">
        <span className="study-assets-label">AI PARSER</span>

        <h2 className="study-assets-title">FILE TO STUDY ASSETS</h2>

        <p className="study-assets-description">
          Auto-generate notes & flashcards from docs.
        </p>
      </div>

      <button
        type="button"
        className="study-assets-upload-button"
        onClick={onOpenUpload}
      >
        <DashboardIcon name="fileUpload" size={16} />

        <span>UPLOAD</span>
      </button>
    </section>
  );
};

export default StudyAssetsBanner;
