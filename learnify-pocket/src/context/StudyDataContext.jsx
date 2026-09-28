import React, { createContext, useContext, useEffect, useState } from "react";

import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebase";

import {
  getSubjects as getSubjectsApi,
  createSubject as createSubjectApi,
  updateSubject as updateSubjectApi,
  deleteSubject as deleteSubjectApi,
} from "../services/SubjectService";

// ==================================================
// STUDY DATA CONTEXT
// ==================================================

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

const INITIAL_SUBJECTS = [];
const INITIAL_NOTES = [];
const INITIAL_FLASHCARDS = [];
const INITIAL_QUIZZES = [];
const INITIAL_TASKS = [];
const INITIAL_PRACTICE = [];

function normalizeSubject(subject, index = 0) {
  return {
    ...subject,
    id: subject.id,
    name: subject.name || "Untitled Subject",
    icon: subject.icon || "subjects",
    color: subject.color || colorForIndex(index),
  };
}

export function StudyDataProvider({ children }) {
  const [subjects, setSubjects] = useState(INITIAL_SUBJECTS);
  const [notes, setNotes] = useState(INITIAL_NOTES);
  const [flashcards, setFlashcards] = useState(INITIAL_FLASHCARDS);
  const [quizzes, setQuizzes] = useState(INITIAL_QUIZZES);
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [practiceExercises, setPracticeExercises] = useState(INITIAL_PRACTICE);

  const [subjectsLoading, setSubjectsLoading] = useState(true);

  const [subjectsError, setSubjectsError] = useState("");

  // ==================================================
  // SUBJECTS API
  // ==================================================

  const loadSubjects = async () => {
    if (!auth.currentUser) {
      setSubjects([]);
      setSubjectsLoading(false);
      return;
    }

    setSubjectsLoading(true);
    setSubjectsError("");

    try {
      const data = await getSubjectsApi();

      const normalizedSubjects = Array.isArray(data)
        ? data.map((subject, index) => normalizeSubject(subject, index))
        : [];

      setSubjects(normalizedSubjects);
    } catch (error) {
      console.error("Failed to load subjects:", error);

      setSubjectsError(error?.message || "Failed to load subjects.");
    } finally {
      setSubjectsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!isMounted) return;

      if (!user) {
        setSubjects([]);
        setSubjectsError("");
        setSubjectsLoading(false);
        return;
      }

      setSubjectsLoading(true);
      setSubjectsError("");

      try {
        const data = await getSubjectsApi();

        if (!isMounted) return;

        const normalizedSubjects = Array.isArray(data)
          ? data.map((subject, index) => normalizeSubject(subject, index))
          : [];

        setSubjects(normalizedSubjects);
      } catch (error) {
        if (!isMounted) return;

        console.error("Failed to load subjects:", error);

        setSubjectsError(error?.message || "Failed to load subjects.");
      } finally {
        if (isMounted) {
          setSubjectsLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // ---------- create subject ----------

  const addSubject = async ({
    name,
    icon = "subjects",
    color,
    description,
  }) => {
    const fallbackColor = color || colorForIndex(subjects.length);

    const payload = {
      name: name.trim(),
      description: description || null,
      icon: icon || "subjects",
      color: fallbackColor,
    };

    const createdSubject = await createSubjectApi(payload);

    const normalizedSubject = normalizeSubject(createdSubject, subjects.length);

    setSubjects((prev) => [...prev, normalizedSubject]);

    return normalizedSubject;
  };

  const updateSubject = async (id, { name, description, icon, color }) => {
    const payload = {
      name: name !== undefined ? name.trim() : undefined,

      description: description !== undefined ? description : undefined,

      icon: icon !== undefined ? icon : undefined,

      color: color !== undefined ? color : undefined,
    };

    const updatedSubject = await updateSubjectApi(id, payload);

    const normalizedSubject = normalizeSubject(
      updatedSubject,
      subjects.findIndex((subject) => String(subject.id) === String(id)),
    );

    setSubjects((prev) =>
      prev.map((subject) =>
        String(subject.id) === String(id) ? normalizedSubject : subject,
      ),
    );

    return normalizedSubject;
  };

  // ---------- delete subject ----------

  const deleteSubject = async (id) => {
    await deleteSubjectApi(id);

    setSubjects((prev) => prev.filter((subject) => subject.id !== id));

    // Clear locally-held related study assets.
    // These will eventually be replaced by their
    // own API-backed contexts/services.
    setNotes((prev) => prev.filter((note) => note.subjectId !== id));

    setFlashcards((prev) => prev.filter((card) => card.subjectId !== id));

    setQuizzes((prev) => prev.filter((quiz) => quiz.subjectId !== id));

    setPracticeExercises((prev) =>
      prev.filter((practice) => practice.subjectId !== id),
    );
  };

  // ==================================================
  // NOTES
  // ==================================================

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
    setNotes((prev) => prev.filter((note) => note.id !== id));

  // ==================================================
  // FLASHCARDS
  // ==================================================

  const addFlashcard = ({ subjectId, front, back }) => {
    const card = {
      id: nextId(),
      subjectId: subjectId ?? null,
      front,
      back,
    };

    setFlashcards((prev) => [card, ...prev]);

    return card;
  };

  const deleteFlashcard = (id) =>
    setFlashcards((prev) => prev.filter((card) => card.id !== id));

  // ==================================================
  // QUIZZES
  // ==================================================

  const addQuiz = ({ subjectId, title, questions }) => {
    const quiz = {
      id: nextId(),
      subjectId: subjectId ?? null,
      title,
      questions: questions.map((question, index) => ({
        id: index + 1,
        ...question,
      })),
    };

    setQuizzes((prev) => [quiz, ...prev]);

    return quiz;
  };

  const deleteQuiz = (id) =>
    setQuizzes((prev) => prev.filter((quiz) => quiz.id !== id));

  // ==================================================
  // TASKS
  // ==================================================

  const addTask = (title, time = "15 MIN") =>
    setTasks((prev) => [
      ...prev,
      {
        id: nextId(),
        title,
        time,
        done: false,
      },
    ]);

  const toggleTask = (id) =>
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? {
              ...task,
              done: !task.done,
            }
          : task,
      ),
    );

  const deleteTask = (id) =>
    setTasks((prev) => prev.filter((task) => task.id !== id));

  // ==================================================
  // PRACTICE
  // ==================================================

  const togglePracticeComplete = (id) =>
    setPracticeExercises((prev) =>
      prev.map((practice) =>
        practice.id === id
          ? {
              ...practice,
              completed: !practice.completed,
            }
          : practice,
      ),
    );

  // ==================================================
  // UPLOAD
  // ==================================================

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

  // ==================================================
  // CONTEXT VALUE
  // ==================================================

  const value = {
    subjects,
    subjectsLoading,
    subjectsError,
    loadSubjects,

    addSubject,
    updateSubject,
    deleteSubject,

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
  };

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
