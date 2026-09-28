import React, { useState } from "react";

import SectionShell from "../../components/shared/SectionShell";
import EmptyState from "../../components/shared/EmptyState";
import DashboardIcon from "../../components/dashboard/DashboardIcon";
import AddCardModal from "../../components/modals/AddCardModal";
import { useStudyData } from "../../context/StudyDataContext";

export default function FlashcardsPage() {
  const {
    subjects,
    flashcards,
    addFlashcard,
    updateFlashcard,
    deleteFlashcard,
  } = useStudyData();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);

  const [isFlipped, setIsFlipped] = useState(false);

  const total = flashcards.length;

  const safeIndex = total > 0 ? Math.min(currentIndex, total - 1) : 0;

  const currentCard = flashcards[safeIndex];

  // ------------------------------------------
  // NAVIGATION
  // ------------------------------------------

  const goTo = (nextIndex) => {
    if (total === 0) {
      return;
    }

    const wrapped = (nextIndex + total) % total;

    setCurrentIndex(wrapped);
    setIsFlipped(false);
  };

  // ------------------------------------------
  // CREATE
  // ------------------------------------------

  const handleCreate = async (card) => {
    await addFlashcard(card);

    setIsAddOpen(false);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  // ------------------------------------------
  // UPDATE
  // ------------------------------------------

  const handleUpdate = async (card) => {
    if (!currentCard) {
      return;
    }

    await updateFlashcard({
      id: currentCard.id,
      subjectId: currentCard.subjectId,
      front: card.front,
      back: card.back,
    });

    setIsEditOpen(false);
    setIsFlipped(false);
  };

  // ------------------------------------------
  // DELETE
  // ------------------------------------------

  const handleDeleteCurrent = async () => {
    if (!currentCard) {
      return;
    }

    const confirmed = window.confirm("Delete this flashcard?");

    if (!confirmed) {
      return;
    }

    try {
      // IMPORTANT:
      // deleteFlashcard expects ONLY the flashcard ID.
      await deleteFlashcard(currentCard.id);

      setIsFlipped(false);

      // Keep the current index inside
      // the remaining flashcard range.
      setCurrentIndex((previousIndex) =>
        Math.min(previousIndex, Math.max(0, total - 2)),
      );
    } catch (error) {
      console.error("Failed to delete flashcard:", error);

      window.alert(error?.message || "Failed to delete flashcard.");
    }
  };

  return (
    <SectionShell
      activeTab="cards"
      title="Flashcards"
      subtitle={`${total} card${total === 1 ? "" : "s"}`}
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
      {total === 0 ? (
        <EmptyState
          message="NO FLASHCARDS YET."
          actionLabel="+ Add Your First Card"
          onAction={() => setIsAddOpen(true)}
        />
      ) : (
        <>
          {/* -------------------------------- */}
          {/* TOOLBAR                           */}
          {/* -------------------------------- */}

          <div className="flashcard-toolbar">
            <span className="flashcard-progress">
              CARD {safeIndex + 1} / {total}
            </span>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              {/* EDIT */}

              <button
                type="button"
                className="pixel-card__edit"
                onClick={() => {
                  setIsFlipped(false);
                  setIsEditOpen(true);
                }}
                aria-label="Edit this card"
              >
                <DashboardIcon name="edit" size={16} />
              </button>

              {/* DELETE */}

              <button
                type="button"
                className="pixel-card__delete"
                onClick={handleDeleteCurrent}
                aria-label="Delete this card"
              >
                <DashboardIcon name="trash" size={16} />
              </button>
            </div>
          </div>

          {/* -------------------------------- */}
          {/* FLASHCARD                         */}
          {/* -------------------------------- */}

          <div className="flashcard-stage">
            <div
              className={`flashcard ${isFlipped ? "flashcard--flipped" : ""}`}
              onClick={() => setIsFlipped((previous) => !previous)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  setIsFlipped((previous) => !previous);
                }
              }}
            >
              <div className="flashcard__face">
                {currentCard.front}

                <span className="flashcard__hint">Tap to flip</span>
              </div>

              <div className="flashcard__face flashcard__face--back">
                {currentCard.back}

                <span className="flashcard__hint">Tap to flip back</span>
              </div>
            </div>
          </div>

          {/* -------------------------------- */}
          {/* NAVIGATION                        */}
          {/* -------------------------------- */}

          <div className="flashcard-controls">
            <button
              type="button"
              className="pixel-button pixel-button--ghost"
              onClick={() => goTo(safeIndex - 1)}
            >
              ← Prev
            </button>

            <button
              type="button"
              className="pixel-button pixel-button--blue"
              onClick={() => goTo(safeIndex + 1)}
            >
              Next →
            </button>
          </div>
        </>
      )}

      {/* ------------------------------------ */}
      {/* ADD MODAL                            */}
      {/* ------------------------------------ */}

      {isAddOpen && (
        <AddCardModal
          subjects={subjects}
          onClose={() => setIsAddOpen(false)}
          onCreate={handleCreate}
        />
      )}

      {/* ------------------------------------ */}
      {/* EDIT MODAL                           */}
      {/* ------------------------------------ */}

      {isEditOpen && currentCard && (
        <AddCardModal
          subjects={subjects}
          defaultSubjectId={currentCard.subjectId}
          initialFront={currentCard.front}
          initialBack={currentCard.back}
          mode="edit"
          onClose={() => setIsEditOpen(false)}
          onCreate={handleUpdate}
        />
      )}
    </SectionShell>
  );
}
