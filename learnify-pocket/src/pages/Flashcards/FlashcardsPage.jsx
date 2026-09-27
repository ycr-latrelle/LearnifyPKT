import React, { useState } from "react";

import SectionShell from "../../components/shared/SectionShell";
import EmptyState from "../../components/shared/EmptyState";
import DashboardIcon from "../../components/dashboard/DashboardIcon";
import AddCardModal from "../../components/modals/AddCardModal";
import { useStudyData } from "../../context/StudyDataContext";

export default function FlashcardsPage() {
  const { subjects, flashcards, addFlashcard, deleteFlashcard } = useStudyData();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const total = flashcards.length;
  const safeIndex = total > 0 ? Math.min(currentIndex, total - 1) : 0;
  const currentCard = flashcards[safeIndex];

  const goTo = (nextIndex) => {
    if (total === 0) return;
    const wrapped = (nextIndex + total) % total;
    setCurrentIndex(wrapped);
    setIsFlipped(false);
  };

  const handleDeleteCurrent = () => {
    if (!currentCard) return;
    deleteFlashcard(currentCard.id);
    setIsFlipped(false);
    setCurrentIndex(0);
  };

  return (
    <SectionShell
      activeTab="cards"
      title="Flashcards"
      subtitle={`${total} card${total === 1 ? "" : "s"}`}
      headerAction={
        <button type="button" className="pixel-fab-add" onClick={() => setIsAddOpen(true)}>
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
          <div className="flashcard-toolbar">
            <span className="flashcard-progress">
              CARD {safeIndex + 1} / {total}
            </span>

            <button
              type="button"
              className="pixel-card__delete"
              onClick={handleDeleteCurrent}
              aria-label="Delete this card"
            >
              <DashboardIcon name="trash" size={16} />
            </button>
          </div>

          <div className="flashcard-stage">
            <div
              className={`flashcard ${isFlipped ? "flashcard--flipped" : ""}`}
              onClick={() => setIsFlipped((prev) => !prev)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") setIsFlipped((prev) => !prev);
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

          <div className="flashcard-controls">
            <button type="button" className="pixel-button pixel-button--ghost" onClick={() => goTo(safeIndex - 1)}>
              ← Prev
            </button>
            <button type="button" className="pixel-button pixel-button--blue" onClick={() => goTo(safeIndex + 1)}>
              Next →
            </button>
          </div>
        </>
      )}

      {isAddOpen && (
        <AddCardModal subjects={subjects} onClose={() => setIsAddOpen(false)} onCreate={addFlashcard} />
      )}
    </SectionShell>
  );
}
