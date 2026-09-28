import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import SectionShell from "../../components/shared/SectionShell";
import DashboardIcon from "../../components/dashboard/DashboardIcon";
import UploadFileModal from "../../components/modals/UploadFileModal";
import { useStudyData } from "../../context/StudyDataContext";
import { getSubject } from "../../services/SubjectService";

export default function SubjectDetailPage() {
  const { subjectId } = useParams();
  const navigate = useNavigate();

  const {
    subjects,
    subjectsLoading,
    notes,
    flashcards,
    quizzes,
    practiceExercises,
    generateAssetsFromUpload,
  } = useStudyData();

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [apiSubject, setApiSubject] = useState(null);
  const [isLoadingSubject, setIsLoadingSubject] = useState(true);
  const [subjectError, setSubjectError] = useState("");

  // Fetch the selected subject directly from the API.
  useEffect(() => {
    let isMounted = true;

    const loadSubject = async () => {
      if (!subjectId) {
        setIsLoadingSubject(false);
        return;
      }

      setIsLoadingSubject(true);
      setSubjectError("");

      try {
        const data = await getSubject(subjectId);

        if (!isMounted) return;

        setApiSubject(data);
      } catch (error) {
        if (!isMounted) return;

        console.error("Failed to load subject:", error);

        setApiSubject(null);
        setSubjectError(error?.message || "Failed to load subject.");
      } finally {
        if (isMounted) {
          setIsLoadingSubject(false);
        }
      }
    };

    loadSubject();

    return () => {
      isMounted = false;
    };
  }, [subjectId]);

  // Use the API subject as the source of truth.
  // Fall back to the already-loaded context subject
  // while keeping everything compatible with the
  // current UI.
  const contextSubject = subjects.find(
    (subject) => String(subject.id) === String(subjectId),
  );

  const subject = apiSubject || contextSubject || null;

  // The current Notes / Flashcards / Quizzes
  // are still coming from the existing context.
  const subjectNotes = notes.filter(
    (note) => String(note.subjectId) === String(subjectId),
  );

  const subjectCards = flashcards.filter(
    (card) => String(card.subjectId) === String(subjectId),
  );

  const subjectQuizzes = quizzes.filter(
    (quiz) => String(quiz.subjectId) === String(subjectId),
  );

  const subjectPractice = practiceExercises.filter(
    (practice) => String(practice.subjectId) === String(subjectId),
  );

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (isLoadingSubject || subjectsLoading) {
    return (
      <SectionShell
        activeTab="subjects"
        title="Loading Subject"
        onBack={() => navigate("/subjects")}
      >
        <p className="section-page__subtitle">Loading subject...</p>
      </SectionShell>
    );
  }

  // --------------------------------------------------
  // NOT FOUND
  // --------------------------------------------------

  if (!subject) {
    return (
      <SectionShell
        activeTab="subjects"
        title="Subject Not Found"
        onBack={() => navigate("/subjects")}
      >
        <p className="section-page__subtitle">
          {subjectError ||
            "This subject may have been deleted. Head back to your subjects list."}
        </p>
      </SectionShell>
    );
  }

  // --------------------------------------------------
  // PAGE
  // --------------------------------------------------

  return (
    <SectionShell
      activeTab="subjects"
      title={subject.name}
      subtitle="Subject overview"
      onBack={() => navigate("/subjects")}
      headerAction={
        <button
          type="button"
          className="pixel-fab-add"
          onClick={() => setIsUploadOpen(true)}
        >
          <DashboardIcon name="fileUpload" size={12} />
          Upload
        </button>
      }
    >
      <div className="subject-detail__stats">
        <div className="subject-detail__stat">
          <span className="subject-detail__stat-value">
            {subjectNotes.length}
          </span>

          <span className="subject-detail__stat-label">Notes</span>
        </div>

        <div className="subject-detail__stat">
          <span className="subject-detail__stat-value">
            {subjectCards.length}
          </span>

          <span className="subject-detail__stat-label">Cards</span>
        </div>

        <div className="subject-detail__stat">
          <span className="subject-detail__stat-value">
            {subjectQuizzes.length}
          </span>

          <span className="subject-detail__stat-label">Quizzes</span>
        </div>

        <div className="subject-detail__stat">
          <span className="subject-detail__stat-value">
            {subjectPractice.length}
          </span>

          <span className="subject-detail__stat-label">Drills</span>
        </div>
      </div>

      <div className="subject-detail__section">
        <div className="subject-detail__section-header">
          <span className="subject-detail__section-title">Notes</span>

          <button
            type="button"
            className="daily-quests__add-button"
            onClick={() => navigate("/notes")}
          >
            View All
            <DashboardIcon name="chevronRight" size={12} />
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

          <button
            type="button"
            className="daily-quests__add-button"
            onClick={() => navigate("/flashcards")}
          >
            View All
            <DashboardIcon name="chevronRight" size={12} />
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

          <button
            type="button"
            className="daily-quests__add-button"
            onClick={() => navigate("/quiz")}
          >
            View All
            <DashboardIcon name="chevronRight" size={12} />
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

                <p className="pixel-card__meta">
                  {quiz.questions.length} question(s)
                </p>
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
