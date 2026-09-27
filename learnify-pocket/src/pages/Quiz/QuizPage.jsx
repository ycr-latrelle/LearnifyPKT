import React, { useState } from "react";

import SectionShell from "../../components/shared/SectionShell";
import EmptyState from "../../components/shared/EmptyState";
import DashboardIcon from "../../components/dashboard/DashboardIcon";
import AddQuizModal from "../../components/modals/AddQuizModal";
import { useStudyData } from "../../context/StudyDataContext";

function QuizRunner({ quiz, onExit }) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const question = quiz.questions[questionIndex];
  const isLast = questionIndex === quiz.questions.length - 1;

  const handleSelect = (optionIndex) => {
    if (selectedOption !== null) return;
    setSelectedOption(optionIndex);
    if (optionIndex === question.correct) setScore((prev) => prev + 1);
  };

  const handleNext = () => {
    if (isLast) {
      setIsFinished(true);
      return;
    }
    setQuestionIndex((prev) => prev + 1);
    setSelectedOption(null);
  };

  if (isFinished) {
    return (
      <div className="quiz-result">
        <span className="quiz-result__score">
          {score} / {quiz.questions.length}
        </span>
        <p className="section-page__subtitle" style={{ margin: 0 }}>
          {score === quiz.questions.length ? "Perfect run!" : "Nice work — review and try again anytime."}
        </p>
        <button type="button" className="pixel-button pixel-button--blue" onClick={onExit}>
          Back to Quizzes
        </button>
      </div>
    );
  }

  return (
    <div className="quiz-runner">
      <div className="quiz-progress-track">
        <div
          className="quiz-progress-fill"
          style={{ width: `${((questionIndex + 1) / quiz.questions.length) * 100}%` }}
        />
      </div>

      <span className="flashcard-progress">
        QUESTION {questionIndex + 1} / {quiz.questions.length}
      </span>

      <h3 className="quiz-question">{question.text}</h3>

      <div className="quiz-options">
        {question.options.map((option, index) => {
          let className = "quiz-option";
          if (selectedOption !== null) {
            if (index === question.correct) className += " quiz-option--correct";
            else if (index === selectedOption) className += " quiz-option--incorrect";
          }

          return (
            <button
              key={index}
              type="button"
              className={className}
              onClick={() => handleSelect(index)}
              disabled={selectedOption !== null}
            >
              {option}
            </button>
          );
        })}
      </div>

      {selectedOption !== null && question.explanation && (
        <p className="quiz-explanation">{question.explanation}</p>
      )}

      {selectedOption !== null && (
        <button type="button" className="pixel-button pixel-button--blue" onClick={handleNext}>
          {isLast ? "See Results" : "Next Question →"}
        </button>
      )}
    </div>
  );
}

export default function QuizPage() {
  const { subjects, quizzes, addQuiz, deleteQuiz } = useStudyData();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [activeQuizId, setActiveQuizId] = useState(null);

  const activeQuiz = quizzes.find((q) => q.id === activeQuizId);
  const subjectName = (subjectId) => subjects.find((s) => s.id === subjectId)?.name;

  if (activeQuiz) {
    return (
      <SectionShell
        activeTab="quiz"
        title={activeQuiz.title}
        subtitle="Quiz in progress"
        onBack={() => setActiveQuizId(null)}
      >
        <QuizRunner quiz={activeQuiz} onExit={() => setActiveQuizId(null)} />
      </SectionShell>
    );
  }

  return (
    <SectionShell
      activeTab="quiz"
      title="Quiz Center"
      subtitle={`${quizzes.length} quiz${quizzes.length === 1 ? "" : "zes"}`}
      headerAction={
        <button type="button" className="pixel-fab-add" onClick={() => setIsAddOpen(true)}>
          <DashboardIcon name="plus" size={12} />
          Add
        </button>
      }
    >
      {quizzes.length === 0 ? (
        <EmptyState
          message="NO QUIZZES YET."
          actionLabel="+ Build Your First Quiz"
          onAction={() => setIsAddOpen(true)}
        />
      ) : (
        <div className="pixel-card-list">
          {quizzes.map((quiz) => (
            <div className="pixel-card" key={quiz.id}>
              <div className="pixel-card__top">
                <div style={{ minWidth: 0 }}>
                  <h3 className="pixel-card__title">{quiz.title}</h3>
                  <p className="pixel-card__meta">
                    {quiz.questions.length} question(s)
                    {subjectName(quiz.subjectId) ? ` · ${subjectName(quiz.subjectId)}` : ""}
                  </p>
                </div>

                <button
                  type="button"
                  className="pixel-card__delete"
                  onClick={() => deleteQuiz(quiz.id)}
                  aria-label={`Delete ${quiz.title}`}
                >
                  <DashboardIcon name="trash" size={14} />
                </button>
              </div>

              <button
                type="button"
                className="pixel-button pixel-button--blue"
                style={{ marginTop: "0.75rem" }}
                onClick={() => setActiveQuizId(quiz.id)}
              >
                Start Quiz →
              </button>
            </div>
          ))}
        </div>
      )}

      {isAddOpen && (
        <AddQuizModal subjects={subjects} onClose={() => setIsAddOpen(false)} onCreate={addQuiz} />
      )}
    </SectionShell>
  );
}
