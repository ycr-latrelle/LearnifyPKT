import React, { createContext, useContext, useMemo, useState } from "react";

// ==================================================
// STUDY DATA CONTEXT
// ==================================================
//
// The API only exposes AuthController right now, so there is
// nowhere to persist subjects/notes/flashcards/quizzes/practice
// yet. This context is the frontend-only stand-in: it keeps the
// study data in memory (starting empty — no mock/seed data) so
// every screen has somewhere consistent to read from and write to.
//
// Swapping this out for real API calls later should only mean
// changing the bodies of the functions below (addSubject, addNote,
// etc.) to call the backend instead of setState, and loading the
// initial arrays from the API on mount instead of starting empty.

const StudyDataContext = createContext(undefined);

let idCounter = 1000;
function nextId() {
  idCounter += 1;
  return idCounter;
}

const SUBJECT_COLORS = ["blue", "amber", "emerald", "purple", "rose"];

function colorForIndex(index) {
  return SUBJECT_COLORS[index % SUBJECT_COLORS.length];
}

// No seed/mock data: every list starts empty and is populated only by
// real user actions (and, once wired up, real API responses). Every
// screen that reads these already renders an EmptyState when empty.
const INITIAL_SUBJECTS = [];
const INITIAL_NOTES = [];
const INITIAL_FLASHCARDS = [];
const INITIAL_QUIZZES = [];
const INITIAL_TASKS = [];
const INITIAL_PRACTICE = [];

export function StudyDataProvider({ children }) {
  const [subjects, setSubjects] = useState(INITIAL_SUBJECTS);
  const [notes, setNotes] = useState(INITIAL_NOTES);
  const [flashcards, setFlashcards] = useState(INITIAL_FLASHCARDS);
  const [quizzes, setQuizzes] = useState(INITIAL_QUIZZES);
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [practiceExercises, setPracticeExercises] = useState(INITIAL_PRACTICE);

  // ---------- subjects ----------
  const addSubject = ({ name, icon = "subjects" }) => {
    const subject = {
      id: nextId(),
      name,
      icon,
      color: colorForIndex(subjects.length),
    };
    setSubjects((prev) => [...prev, subject]);
    return subject;
  };

  const deleteSubject = (id) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    setNotes((prev) => prev.filter((n) => n.subjectId !== id));
    setFlashcards((prev) => prev.filter((c) => c.subjectId !== id));
    setQuizzes((prev) => prev.filter((q) => q.subjectId !== id));
    setPracticeExercises((prev) => prev.filter((p) => p.subjectId !== id));
  };

  // ---------- notes ----------
  const addNote = ({ subjectId, title, content }) => {
    const note = {
      id: nextId(),
      subjectId: subjectId ?? null,
      title,
      content,
      createdAt: Date.now(),
    };
    setNotes((prev) => [note, ...prev]);
    return note;
  };

  const deleteNote = (id) =>
    setNotes((prev) => prev.filter((n) => n.id !== id));

  // ---------- flashcards ----------
  const addFlashcard = ({ subjectId, front, back }) => {
    const card = { id: nextId(), subjectId: subjectId ?? null, front, back };
    setFlashcards((prev) => [card, ...prev]);
    return card;
  };

  const deleteFlashcard = (id) =>
    setFlashcards((prev) => prev.filter((c) => c.id !== id));

  // ---------- quizzes ----------
  const addQuiz = ({ subjectId, title, questions }) => {
    const quiz = {
      id: nextId(),
      subjectId: subjectId ?? null,
      title,
      questions: questions.map((q, i) => ({ id: i + 1, ...q })),
    };
    setQuizzes((prev) => [quiz, ...prev]);
    return quiz;
  };

  const deleteQuiz = (id) =>
    setQuizzes((prev) => prev.filter((q) => q.id !== id));

  // ---------- tasks (daily quests) ----------
  const addTask = (title, time = "15 MIN") =>
    setTasks((prev) => [...prev, { id: nextId(), title, time, done: false }]);

  const toggleTask = (id) =>
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    );

  const deleteTask = (id) =>
    setTasks((prev) => prev.filter((t) => t.id !== id));

  // ---------- practice ----------
  const togglePracticeComplete = (id) =>
    setPracticeExercises((prev) =>
      prev.map((p) => (p.id === id ? { ...p, completed: !p.completed } : p)),
    );

  // ---------- upload -> study assets ----------
  // Stands in for the "AI Parser" flow from the design reference. There is
  // no AI/backend endpoint wired up yet, so this just turns an uploaded
  // file name into a starter note + task, clearly local/placeholder content.
  const generateAssetsFromUpload = ({ fileName, subjectId }) => {
    const baseTitle = fileName.replace(/\.[^/.]+$/, "") || "Uploaded Document";

    const note = addNote({
      subjectId,
      title: `Summary: ${baseTitle}`,
      content: `Placeholder summary generated from "${fileName}". Once the AI/backend parsing endpoint is connected, this will contain real generated notes.`,
    });

    addTask(`Review notes from ${baseTitle}`, "15 MIN");

    return { note };
  };

  const value = useMemo(
    () => ({
      subjects,
      notes,
      flashcards,
      quizzes,
      tasks,
      practiceExercises,
      addSubject,
      deleteSubject,
      addNote,
      deleteNote,
      addFlashcard,
      deleteFlashcard,
      addQuiz,
      deleteQuiz,
      addTask,
      toggleTask,
      deleteTask,
      togglePracticeComplete,
      generateAssetsFromUpload,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [subjects, notes, flashcards, quizzes, tasks, practiceExercises],
  );

  return (
    <StudyDataContext.Provider value={value}>
      {children}
    </StudyDataContext.Provider>
  );
}

export function useStudyData() {
  const ctx = useContext(StudyDataContext);
  if (!ctx) {
    throw new Error("useStudyData must be used within a StudyDataProvider");
  }
  return ctx;
}

export default StudyDataContext;
