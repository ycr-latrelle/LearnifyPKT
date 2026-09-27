import React from "react";
import QuickStatCard from "./QuickStatCard";

export default function QuickStatsGrid({
  subjects = [],
  notes = [],
  flashcards = [],
  quizzes = [],
  onNavigate,
}) {
  return (
    <section className="quick-stats-grid">
      <QuickStatCard
        label="SUBJ"
        value={subjects.length}
        onClick={() => onNavigate("subjects")}
      />

      <QuickStatCard
        label="NOTE"
        value={notes.length}
        onClick={() => onNavigate("notes")}
      />

      <QuickStatCard
        label="CARD"
        value={flashcards.length}
        onClick={() => onNavigate("cards")}
      />

      <QuickStatCard
        label="QUIZ"
        value={quizzes.length}
        onClick={() => onNavigate("quiz")}
      />
    </section>
  );
}
