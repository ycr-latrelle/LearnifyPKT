import React, { useState } from "react";
import Modal from "../shared/Modal";
import DashboardIcon from "../dashboard/DashboardIcon";

function emptyQuestion() {
  return { text: "", options: ["", ""], correct: 0 };
}

export default function AddQuizModal({ subjects = [], defaultSubjectId = null, onClose, onCreate }) {
  const [title, setTitle] = useState("");
  const [subjectId, setSubjectId] = useState(defaultSubjectId ?? "");
  const [questions, setQuestions] = useState([emptyQuestion()]);
  const [error, setError] = useState("");

  const updateQuestion = (index, patch) => {
    setQuestions((prev) => prev.map((q, i) => (i === index ? { ...q, ...patch } : q)));
  };

  const updateOption = (qIndex, optIndex, value) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIndex) return q;
        const options = q.options.map((o, oi) => (oi === optIndex ? value : o));
        return { ...q, options };
      }),
    );
  };

  const addOption = (qIndex) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === qIndex ? { ...q, options: [...q.options, ""] } : q)),
    );
  };

  const removeQuestion = (index) => {
    setQuestions((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  };

  const addQuestion = () => setQuestions((prev) => [...prev, emptyQuestion()]);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!title.trim()) {
      setError("Quiz title is required.");
      return;
    }

    const cleanedQuestions = questions
      .map((q) => ({
        text: q.text.trim(),
        options: q.options.map((o) => o.trim()).filter(Boolean),
        correct: q.correct,
      }))
      .filter((q) => q.text && q.options.length >= 2);

    if (cleanedQuestions.length === 0) {
      setError("Add at least one question with 2+ answer options.");
      return;
    }

    onCreate({
      title: title.trim(),
      subjectId: subjectId ? Number(subjectId) : null,
      questions: cleanedQuestions.map((q) => ({
        text: q.text,
        options: q.options,
        correct: Math.min(q.correct, q.options.length - 1),
        explanation: "",
      })),
    });
    onClose();
  };

  return (
    <Modal title="Add Quiz" onClose={onClose} wide>
      <form onSubmit={handleSubmit}>
        <div className="pixel-field">
          <label htmlFor="quiz-title">Quiz Title</label>
          <input
            id="quiz-title"
            type="text"
            className="pixel-input"
            placeholder="e.g. Recursion Basics"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            autoFocus
          />
        </div>

        {subjects.length > 0 && (
          <div className="pixel-field">
            <label htmlFor="quiz-subject">Subject</label>
            <select
              id="quiz-subject"
              className="pixel-select"
              value={subjectId}
              onChange={(event) => setSubjectId(event.target.value)}
            >
              <option value="">No subject</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {questions.map((question, qIndex) => (
          <div className="question-builder-card" key={qIndex}>
            <div className="question-builder-card__header">
              <span className="question-builder-card__title">Question {qIndex + 1}</span>

              {questions.length > 1 && (
                <button
                  type="button"
                  className="pixel-card__delete"
                  onClick={() => removeQuestion(qIndex)}
                  aria-label={`Remove question ${qIndex + 1}`}
                >
                  <DashboardIcon name="trash" size={14} />
                </button>
              )}
            </div>

            <div className="pixel-field">
              <input
                type="text"
                className="pixel-input"
                placeholder="Question text"
                value={question.text}
                onChange={(event) => updateQuestion(qIndex, { text: event.target.value })}
              />
            </div>

            {question.options.map((option, optIndex) => (
              <div className="option-row" key={optIndex}>
                <input
                  type="radio"
                  name={`correct-${qIndex}`}
                  checked={question.correct === optIndex}
                  onChange={() => updateQuestion(qIndex, { correct: optIndex })}
                  aria-label={`Mark option ${optIndex + 1} as correct`}
                />
                <input
                  type="text"
                  className="pixel-input"
                  placeholder={`Option ${optIndex + 1}`}
                  value={option}
                  onChange={(event) => updateOption(qIndex, optIndex, event.target.value)}
                />
              </div>
            ))}

            <button
              type="button"
              className="pixel-button pixel-button--ghost"
              style={{ fontSize: "0.5625rem", padding: "0.375rem 0.625rem" }}
              onClick={() => addOption(qIndex)}
            >
              + Add Option
            </button>
          </div>
        ))}

        <button type="button" className="pixel-button pixel-button--ghost" onClick={addQuestion}>
          + Add Question
        </button>

        {error && <p className="form-error">{error}</p>}

        <div className="form-actions">
          <button type="button" className="pixel-button pixel-button--ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="pixel-button pixel-button--blue">
            Save Quiz
          </button>
        </div>
      </form>
    </Modal>
  );
}
