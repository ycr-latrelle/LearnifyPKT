import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import SectionShell from "../../components/shared/SectionShell";
import DashboardIcon from "../../components/dashboard/DashboardIcon";
import UploadFileModal from "../../components/modals/UploadFileModal";
import { useStudyData } from "../../context/StudyDataContext";

export default function SubjectDetailPage() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const id = Number(subjectId);

  const { subjects, notes, flashcards, quizzes, practiceExercises, generateAssetsFromUpload } =
    useStudyData();

  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const subject = subjects.find((s) => s.id === id);

  const subjectNotes = notes.filter((n) => n.subjectId === id);
  const subjectCards = flashcards.filter((c) => c.subjectId === id);
  const subjectQuizzes = quizzes.filter((q) => q.subjectId === id);
  const subjectPractice = practiceExercises.filter((p) => p.subjectId === id);

  if (!subject) {
    return (
      <SectionShell activeTab="subjects" title="Subject Not Found" onBack={() => navigate("/subjects")}>
        <p className="section-page__subtitle">
          This subject may have been deleted. Head back to your subjects list.
        </p>
      </SectionShell>
    );
  }

  return (
    <SectionShell
      activeTab="subjects"
      title={subject.name}
      subtitle="Subject overview"
      onBack={() => navigate("/subjects")}
      headerAction={
        <button type="button" className="pixel-fab-add" onClick={() => setIsUploadOpen(true)}>
          <DashboardIcon name="fileUpload" size={12} />
          Upload
        </button>
      }
    >
      <div className="subject-detail__stats">
        <div className="subject-detail__stat">
          <span className="subject-detail__stat-value">{subjectNotes.length}</span>
          <span className="subject-detail__stat-label">Notes</span>
        </div>
        <div className="subject-detail__stat">
          <span className="subject-detail__stat-value">{subjectCards.length}</span>
          <span className="subject-detail__stat-label">Cards</span>
        </div>
        <div className="subject-detail__stat">
          <span className="subject-detail__stat-value">{subjectQuizzes.length}</span>
          <span className="subject-detail__stat-label">Quizzes</span>
        </div>
        <div className="subject-detail__stat">
          <span className="subject-detail__stat-value">{subjectPractice.length}</span>
          <span className="subject-detail__stat-label">Drills</span>
        </div>
      </div>

      <div className="subject-detail__section">
        <div className="subject-detail__section-header">
          <span className="subject-detail__section-title">Notes</span>
          <button type="button" className="daily-quests__add-button" onClick={() => navigate("/notes")}>
            View All <DashboardIcon name="chevronRight" size={12} />
          </button>
        </div>

        {subjectNotes.length === 0 ? (
          <div className="empty-quest-state">
            <p>NO NOTES YET.</p>
          </div>
        ) : (
          <div className="pixel-card-list">
            {subjectNotes.map((note) => (
              <div className="pixel-card" key={note.id}>
                <h3 className="pixel-card__title">{note.title}</h3>
                <p className="pixel-card__meta">{note.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="subject-detail__section">
        <div className="subject-detail__section-header">
          <span className="subject-detail__section-title">Flashcards</span>
          <button type="button" className="daily-quests__add-button" onClick={() => navigate("/flashcards")}>
            View All <DashboardIcon name="chevronRight" size={12} />
          </button>
        </div>

        {subjectCards.length === 0 ? (
          <div className="empty-quest-state">
            <p>NO FLASHCARDS YET.</p>
          </div>
        ) : (
          <div className="pixel-card-list">
            {subjectCards.map((card) => (
              <div className="pixel-card" key={card.id}>
                <h3 className="pixel-card__title">{card.front}</h3>
                <p className="pixel-card__meta">{card.back}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="subject-detail__section">
        <div className="subject-detail__section-header">
          <span className="subject-detail__section-title">Quizzes</span>
          <button type="button" className="daily-quests__add-button" onClick={() => navigate("/quiz")}>
            View All <DashboardIcon name="chevronRight" size={12} />
          </button>
        </div>

        {subjectQuizzes.length === 0 ? (
          <div className="empty-quest-state">
            <p>NO QUIZZES YET.</p>
          </div>
        ) : (
          <div className="pixel-card-list">
            {subjectQuizzes.map((quiz) => (
              <div className="pixel-card" key={quiz.id}>
                <h3 className="pixel-card__title">{quiz.title}</h3>
                <p className="pixel-card__meta">{quiz.questions.length} question(s)</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {isUploadOpen && (
        <UploadFileModal
          subjects={subjects}
          defaultSubjectId={subject.id}
          onClose={() => setIsUploadOpen(false)}
          onUpload={generateAssetsFromUpload}
        />
      )}
    </SectionShell>
  );
}
