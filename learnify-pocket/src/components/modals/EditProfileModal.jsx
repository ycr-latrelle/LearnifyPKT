import React, { useState } from "react";
import Modal from "../shared/Modal";

export default function EditProfileModal({ profile, onClose, onSave }) {
  const [name, setName] = useState(profile?.name || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [targetDailyMinutes, setTargetDailyMinutes] = useState(
    profile?.targetDailyMinutes ?? 60,
  );
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    onSave({
      name: name.trim(),
      bio: bio.trim(),
      targetDailyMinutes: Number(targetDailyMinutes) || 0,
    });
    onClose();
  };

  return (
    <Modal title="Edit Profile" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="pixel-field">
          <label htmlFor="profile-name">Display Name</label>
          <input
            id="profile-name"
            type="text"
            className="pixel-input"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoFocus
          />
        </div>

        <div className="pixel-field">
          <label htmlFor="profile-bio">Bio</label>
          <textarea
            id="profile-bio"
            className="pixel-textarea"
            style={{ minHeight: "3.5rem" }}
            placeholder="e.g. CS student grinding data structures"
            value={bio}
            onChange={(event) => setBio(event.target.value)}
          />
        </div>

        <div className="pixel-field">
          <label htmlFor="profile-target">Daily Study Goal (minutes)</label>
          <input
            id="profile-target"
            type="number"
            min="0"
            className="pixel-input"
            value={targetDailyMinutes}
            onChange={(event) => setTargetDailyMinutes(event.target.value)}
          />
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="form-actions">
          <button type="button" className="pixel-button pixel-button--ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="pixel-button pixel-button--blue">
            Save Changes
          </button>
        </div>
      </form>
    </Modal>
  );
}
