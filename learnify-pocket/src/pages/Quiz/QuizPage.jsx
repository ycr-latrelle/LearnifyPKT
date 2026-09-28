import React, { useState } from "react";

import SectionShell from "../../components/shared/SectionShell";
import EmptyState from "../../components/shared/EmptyState";
import DashboardIcon from "../../components/dashboard/DashboardIcon";
import AddQuizModal from "../../components/modals/AddQuizModal";
import { useStudyData } from "../../context/StudyDataContext";

// ==================================================
// QUIZ RUNNER
// ==================================================

function QuizRunner({ quiz, onExit }) {
  const questions = Array.isArray(quiz?.questions) ? quiz.questions : [];

  const [questionIndex, setQuestionIndex] = useState(0);

  const [selectedOption, setSelectedOption] = useState(null);

  const [submittedOption, setSubmittedOption] = useState(null);

  const [score, setScore] = useState(0);

  const [isFinished, setIsFinished] = useState(false);

  // --------------------------------------------------
  // NO QUESTIONS
  // --------------------------------------------------

  if (questions.length === 0) {
    return (
      <div className="quiz-result">
        <span className="quiz-result__score">NO QUESTIONS</span>

        <p className="section-page__subtitle" style={{ margin: 0 }}>
          This quiz does not contain any questions yet.
        </p>

        <button
          type="button"
          className="pixel-button pixel-button--blue"
          onClick={onExit}
        >
          Back to Quizzes
        </button>
      </div>
    );
  }

  const question = questions[questionIndex];

  const isLast = questionIndex === questions.length - 1;

  // --------------------------------------------------
  // SELECT ANSWER
  // --------------------------------------------------

  const handleSelect = (optionIndex) => {
    // Once an answer has been submitted,
    // prevent changing it.
    if (submittedOption !== null) {
      return;
    }

    setSelectedOption(optionIndex);
  };

  // --------------------------------------------------
  // SUBMIT ANSWER
  // --------------------------------------------------

  const handleSubmit = () => {
    if (selectedOption === null || submittedOption !== null) {
      return;
    }

    setSubmittedOption(selectedOption);

    // Backend uses zero-based correctAnswer.
    if (selectedOption === Number(question.correctAnswer)) {
      setScore((previousScore) => previousScore + 1);
    }
  };

  // --------------------------------------------------
  // NEXT QUESTION
  // --------------------------------------------------

  const handleNext = () => {
    if (submittedOption === null) {
      return;
    }

    if (isLast) {
      setIsFinished(true);

      return;
    }

    setQuestionIndex((previousIndex) => previousIndex + 1);

    setSelectedOption(null);
    setSubmittedOption(null);
  };

  // --------------------------------------------------
  // FINISHED
  // --------------------------------------------------

  if (isFinished) {
    return (
      <div className="quiz-result">
        <span className="quiz-result__score">
          {score} / {questions.length}
        </span>

        <p className="section-page__subtitle" style={{ margin: 0 }}>
          {score === questions.length
            ? "Perfect run!"
            : "Nice work — review and try again anytime."}
        </p>

        <button
          type="button"
          className="pixel-button pixel-button--blue"
          onClick={onExit}
        >
          Back to Quizzes
        </button>
      </div>
    );
  }

  const correctAnswer = Number(question.correctAnswer);

  // --------------------------------------------------
  // RUNNER
  // --------------------------------------------------

  return (
    <div className="quiz-runner">
      {/* ------------------------------------------ */}
      {/* PROGRESS                                   */}
      {/* ------------------------------------------ */}

      <div className="quiz-progress-track">
        <div
          className="quiz-progress-fill"
          style={{
            width: `${((questionIndex + 1) / questions.length) * 100}%`,
          }}
        />
      </div>

      <span className="flashcard-progress">
        QUESTION {questionIndex + 1} / {questions.length}
      </span>

      {/* ------------------------------------------ */}
      {/* QUESTION                                  */}
      {/* ------------------------------------------ */}

      <h3 className="quiz-question">
        {question.question || "Question unavailable."}
      </h3>

      {/* ------------------------------------------ */}
      {/* OPTIONS                                   */}
      {/* ------------------------------------------ */}

      <div className="quiz-options">
        {Array.isArray(question.options) &&
          question.options.map((option, index) => {
            let className = "quiz-option";

            // After submission:
            // show correct answer.
            if (submittedOption !== null) {
              if (index === correctAnswer) {
                className += " quiz-option--correct";
              } else if (index === submittedOption) {
                className += " quiz-option--incorrect";
              }
            }
            // Before submission:
            // highlight only the currently
            // selected answer.
            else if (selectedOption === index) {
              className += " quiz-option--selected";
            }

            return (
              <button
                key={index}
                type="button"
                className={className}
                onClick={() => handleSelect(index)}
                disabled={submittedOption !== null}
              >
                <span
                  style={{
                    display: "inline-block",
                    minWidth: "1.4rem",
                    marginRight: "0.4rem",
                    fontWeight: 900,
                  }}
                >
                  {String.fromCharCode(65 + index)}.
                </span>

                {option}
              </button>
            );
          })}
      </div>

      {/* ------------------------------------------ */}
      {/* RESULT / EXPLANATION                       */}
      {/* ------------------------------------------ */}

      {submittedOption !== null && (
        <div
          className="quiz-explanation"
          style={{
            marginTop: "0.75rem",
          }}
        >
          {submittedOption === correctAnswer ? (
            <p
              style={{
                marginTop: 0,
              }}
            >
              <strong>Correct!</strong>
            </p>
          ) : (
            <p
              style={{
                marginTop: 0,
              }}
            >
              <strong>Incorrect.</strong>
            </p>
          )}

          {question.explanation && (
            <p
              style={{
                marginBottom: 0,
              }}
            >
              {question.explanation}
            </p>
          )}
        </div>
      )}

      {/* ------------------------------------------ */}
      {/* ACTIONS                                   */}
      {/* ------------------------------------------ */}

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: "0.75rem",
        }}
      >
        {submittedOption === null ? (
          <button
            type="button"
            className="pixel-button pixel-button--blue"
            onClick={handleSubmit}
            disabled={selectedOption === null}
          >
            Submit Answer
          </button>
        ) : (
          <button
            type="button"
            className="pixel-button pixel-button--blue"
            onClick={handleNext}
          >
            {isLast ? "See Results" : "Next Question →"}
          </button>
        )}
      </div>
    </div>
  );
}

// ==================================================
// QUIZ PAGE
// ==================================================

export default function QuizPage() {
  const { subjects, quizzes, addQuiz, deleteQuiz } = useStudyData();

  const [isAddOpen, setIsAddOpen] = useState(false);

  const [activeQuizId, setActiveQuizId] = useState(null);

  const activeQuiz = quizzes.find(
    (quiz) => String(quiz.id) === String(activeQuizId),
  );

  const subjectName = (subjectId) =>
    subjects.find((subject) => String(subject.id) === String(subjectId))?.name;

  // ==================================================
  // RUN QUIZ
  // ==================================================

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

  // ==================================================
  // QUIZ LIST
  // ==================================================

  return (
    <SectionShell
      activeTab="quiz"
      title="Quiz Center"
      subtitle={`${quizzes.length} quiz${quizzes.length === 1 ? "" : "zes"}`}
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
                <div
                  style={{
                    minWidth: 0,
                  }}
                >
                  <h3 className="pixel-card__title">{quiz.title}</h3>

                  <p className="pixel-card__meta">
                    {Array.isArray(quiz.questions) ? quiz.questions.length : 0}{" "}
                    question(s)
                    {subjectName(quiz.subjectId)
                      ? ` · ${subjectName(quiz.subjectId)}`
                      : ""}
                  </p>
                </div>

                <button
                  type="button"
                  className="pixel-card__delete"
                  onClick={async () => {
                    const confirmed = window.confirm(`Delete "${quiz.title}"?`);

                    if (!confirmed) {
                      return;
                    }

                    try {
                      await deleteQuiz(quiz.id);
                    } catch (error) {
                      console.error("Failed to delete quiz:", error);

                      window.alert(error?.message || "Failed to delete quiz.");
                    }
                  }}
                  aria-label={`Delete ${quiz.title}`}
                >
                  <DashboardIcon name="trash" size={14} />
                </button>
              </div>

              <button
                type="button"
                className="pixel-button pixel-button--blue"
                style={{
                  marginTop: "0.75rem",
                }}
                disabled={
                  !Array.isArray(quiz.questions) || quiz.questions.length === 0
                }
                onClick={() => setActiveQuizId(quiz.id)}
              >
                {Array.isArray(quiz.questions) && quiz.questions.length > 0
                  ? "Start Quiz →"
                  : "No Questions"}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ------------------------------------ */}
      {/* ADD QUIZ                             */}
      {/* ------------------------------------ */}

      {isAddOpen && (
        <AddQuizModal
          subjects={subjects}
          onClose={() => setIsAddOpen(false)}
          onCreate={async (quiz) => {
            await addQuiz(quiz);

            setIsAddOpen(false);
          }}
        />
      )}
    </SectionShell>
  );
}
