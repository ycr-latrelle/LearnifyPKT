import React, { useState } from "react";

import SectionShell from "../../components/shared/SectionShell";
import EmptyState from "../../components/shared/EmptyState";
import DashboardIcon from "../../components/dashboard/DashboardIcon";
import AddNoteModal from "../../components/modals/AddNoteModal";
import { useStudyData } from "../../context/StudyDataContext";

export default function NotesPage() {
  const { subjects, notes, addNote, deleteNote } = useStudyData();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const subjectName = (subjectId) => subjects.find((s) => s.id === subjectId)?.name;

  return (
    <SectionShell
      activeTab="notes"
      title="Notes"
      subtitle={`${notes.length} note${notes.length === 1 ? "" : "s"}`}
      headerAction={
        <button type="button" className="pixel-fab-add" onClick={() => setIsAddOpen(true)}>
          <DashboardIcon name="plus" size={12} />
          Add
        </button>
      }
    >
      {notes.length === 0 ? (
        <EmptyState
          message="NO NOTES YET."
          actionLabel="+ Write Your First Note"
          onAction={() => setIsAddOpen(true)}
        />
      ) : (
        <div className="pixel-card-list">
          {notes.map((note) => {
            const isExpanded = expandedId === note.id;
            return (
              <div className={`pixel-card ${isExpanded ? "note-card--expanded" : ""}`} key={note.id}>
                <div className="pixel-card__top">
                  <div style={{ minWidth: 0 }}>
                    <h3 className="pixel-card__title">{note.title}</h3>
                    {subjectName(note.subjectId) && (
                      <span className="pixel-card__badge">{subjectName(note.subjectId)}</span>
                    )}
                  </div>

                  <button
                    type="button"
                    className="pixel-card__delete"
                    onClick={() => deleteNote(note.id)}
                    aria-label={`Delete ${note.title}`}
                  >
                    <DashboardIcon name="trash" size={14} />
                  </button>
                </div>

                <p className="note-card__preview">
                  {isExpanded ? note.content : `${note.content.slice(0, 90)}${note.content.length > 90 ? "..." : ""}`}
                </p>

                {note.content.length > 90 && (
                  <button
                    type="button"
                    className="note-card__toggle"
                    onClick={() => setExpandedId(isExpanded ? null : note.id)}
                  >
                    {isExpanded ? "Show Less" : "Read More"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {isAddOpen && (
        <AddNoteModal subjects={subjects} onClose={() => setIsAddOpen(false)} onCreate={addNote} />
      )}
    </SectionShell>
  );
}
