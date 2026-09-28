import React, { useState } from "react";

import SectionShell from "../../components/shared/SectionShell";
import EmptyState from "../../components/shared/EmptyState";
import DashboardIcon from "../../components/dashboard/DashboardIcon";
import AddNoteModal from "../../components/modals/AddNoteModal";
import EditNoteModal from "../../components/modals/EditNoteModal";

import { useStudyData } from "../../context/StudyDataContext";

export default function NotesPage() {
  const { subjects, notes, addNote, updateNote, deleteNote } = useStudyData();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const subjectName = (subjectId) => {
    return (
      subjects.find((subject) => String(subject.id) === String(subjectId))
        ?.name || ""
    );
  };

  const handleEdit = (note) => {
    setEditingNote(note);
  };

  const handleUpdate = async (noteId, updatedNote) => {
    await updateNote(noteId, updatedNote);
  };

  const handleDelete = async (noteId) => {
    try {
      await deleteNote(noteId);

      if (expandedId === noteId) {
        setExpandedId(null);
      }

      if (editingNote?.id === noteId) {
        setEditingNote(null);
      }
    } catch (error) {
      console.error("Failed to delete note:", error);
    }
  };

  return (
    <SectionShell
      activeTab="notes"
      title="Notes"
      subtitle={`${notes.length} note${notes.length === 1 ? "" : "s"}`}
      headerAction={
        <button
          type="button"
          className="pixel-fab-add"
          onClick={() => setIsAddOpen(true)}
        >
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

            const currentSubjectName = subjectName(note.subjectId);

            return (
              <div
                className={`pixel-card ${
                  isExpanded ? "note-card--expanded" : ""
                }`}
                key={note.id}
              >
                <div className="pixel-card__top">
                  <div
                    style={{
                      minWidth: 0,
                      flex: 1,
                    }}
                  >
                    <h3 className="pixel-card__title">{note.title}</h3>

                    {currentSubjectName && (
                      <span className="pixel-card__badge">
                        {currentSubjectName}
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      flexShrink: 0,
                    }}
                  >
                    {/* Edit */}
                    <button
                      type="button"
                      className="pixel-card__edit"
                      onClick={() => handleEdit(note)}
                      aria-label={`Edit ${note.title}`}
                      title="Edit note"
                    >
                      ✎
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      className="pixel-card__delete"
                      onClick={() => handleDelete(note.id)}
                      aria-label={`Delete ${note.title}`}
                      title="Delete note"
                    >
                      <DashboardIcon name="trash" size={14} />
                    </button>
                  </div>
                </div>

                <p className="note-card__preview">
                  {isExpanded
                    ? note.content
                    : `${note.content.slice(0, 90)}${
                        note.content.length > 90 ? "..." : ""
                      }`}
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

      {/* Add Note */}
      {isAddOpen && (
        <AddNoteModal
          subjects={subjects}
          onClose={() => setIsAddOpen(false)}
          onCreate={addNote}
        />
      )}

      {/* Edit Note */}
      {editingNote && (
        <EditNoteModal
          note={editingNote}
          subjects={subjects}
          onClose={() => setEditingNote(null)}
          onUpdate={handleUpdate}
        />
      )}
    </SectionShell>
  );
}
