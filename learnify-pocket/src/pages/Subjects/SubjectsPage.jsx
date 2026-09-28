import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import SectionShell from "../../components/shared/SectionShell";
import EmptyState from "../../components/shared/EmptyState";
import DashboardIcon from "../../components/dashboard/DashboardIcon";
import AddSubjectModal from "../../components/modals/AddSubjectModal";
import EditSubjectModal from "../../components/modals/EditSubjectModal";
import { useStudyData } from "../../context/StudyDataContext";

export default function SubjectsPage() {
  const navigate = useNavigate();

  const {
    subjects,
    subjectsLoading,
    subjectsError,
    notes,
    flashcards,
    quizzes,
    addSubject,
    updateSubject,
    deleteSubject,
  } = useStudyData();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);

  const countFor = (subjectId, list) =>
    list.filter((item) => String(item.subjectId) === String(subjectId)).length;

  const handleDelete = async (event, id) => {
    event.stopPropagation();

    if (!window.confirm("Delete this subject and everything linked to it?")) {
      return;
    }

    try {
      await deleteSubject(id);
    } catch (error) {
      console.error("Failed to delete subject:", error);

      window.alert(error?.message || "Failed to delete subject.");
    }
  };

  const handleEdit = (event, subject) => {
    event.stopPropagation();
    setEditingSubject(subject);
  };

  const handleOpenSubject = (id) => {
    navigate(`/subjects/${id}`);
  };

  const handleCardKeyDown = (event, id) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleOpenSubject(id);
    }
  };

  return (
    <SectionShell
      activeTab="subjects"
      title="Subjects"
      subtitle={`${subjects.length} subject${subjects.length === 1 ? "" : "s"}`}
      headerAction={
        <button
          type="button"
          className="pixel-fab-add subject-floating-add"
          onClick={() => setIsAddOpen(true)}
          aria-label="Add subject"
        >
          <DashboardIcon name="pen" size={16} />
        </button>
      }
    >
      {subjectsLoading ? (
        <div className="empty-quest-state">
          <p>LOADING SUBJECTS...</p>
        </div>
      ) : subjectsError ? (
        <div className="empty-quest-state">
          <p>{subjectsError || "FAILED TO LOAD SUBJECTS."}</p>

          <button
            type="button"
            className="pixel-fab-add"
            onClick={() => window.location.reload()}
          >
            TRY AGAIN
          </button>
        </div>
      ) : subjects.length === 0 ? (
        <EmptyState
          message="NO SUBJECTS YET."
          actionLabel="+ Add Your First Subject"
          onAction={() => setIsAddOpen(true)}
        />
      ) : (
        <div className="subject-grid">
          {subjects.map((subject) => (
            <div
              key={subject.id}
              className={`subject-card subject-card--${
                subject.color || "blue"
              }`}
              role="button"
              tabIndex={0}
              onClick={() => handleOpenSubject(subject.id)}
              onKeyDown={(event) => handleCardKeyDown(event, subject.id)}
            >
              <div className="subject-card__actions">
                <button
                  type="button"
                  className="subject-card__edit"
                  onClick={(event) => handleEdit(event, subject)}
                  aria-label={`Edit ${subject.name}`}
                >
                  Edit
                </button>

                <button
                  type="button"
                  className="subject-card__delete"
                  onClick={(event) => handleDelete(event, subject.id)}
                  aria-label={`Delete ${subject.name}`}
                >
                  <DashboardIcon name="x" size={12} />
                </button>
              </div>

              <span className="subject-card__icon">
                <DashboardIcon name={subject.icon || "subjects"} size={18} />
              </span>

              <span className="subject-card__name">{subject.name}</span>

              <span className="subject-card__meta">
                {countFor(subject.id, notes)} NOTES ·{" "}
                {countFor(subject.id, flashcards)} CARDS ·{" "}
                {countFor(subject.id, quizzes)} QUIZ
              </span>
            </div>
          ))}

          <button
            type="button"
            className="subject-card subject-card__add"
            onClick={() => setIsAddOpen(true)}
          >
            <DashboardIcon name="plus" size={20} />

            <span className="subject-card__meta">ADD SUBJECT</span>
          </button>
        </div>
      )}

      {isAddOpen && (
        <AddSubjectModal
          onClose={() => setIsAddOpen(false)}
          onCreate={addSubject}
        />
      )}

      {editingSubject && (
        <EditSubjectModal
          subject={editingSubject}
          onClose={() => setEditingSubject(null)}
          onUpdate={updateSubject}
        />
      )}
    </SectionShell>
  );
}
