import React, { createContext, useContext, useEffect, useState } from "react";

import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebase";

import {
  getSubjects as getSubjectsApi,
  createSubject as createSubjectApi,
  updateSubject as updateSubjectApi,
  deleteSubject as deleteSubjectApi,
} from "../services/SubjectService";

import {
  getNotes as getNotesApi,
  createNote as createNoteApi,
  updateNote as updateNoteApi,
  deleteNote as deleteNoteApi,
} from "../services/NoteService";

import {
  getFlashcards as getFlashcardsApi,
  createFlashcard as createFlashcardApi,
  updateFlashcard as updateFlashcardApi,
  deleteFlashcard as deleteFlashcardApi,
} from "../services/FlashcardService";

import {
  getQuizzes as getQuizzesApi,
  createQuiz as createQuizApi,
  updateQuiz as updateQuizApi,
  deleteQuiz as deleteQuizApi,
} from "../services/QuizService";

import { generateStudyFromFile } from "../services/StudyGenerationService";

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

// ==================================================
// NORMALIZERS
// ==================================================

function normalizeSubject(subject, index = 0) {
  return {
    ...subject,

    id: subject.id,

    name: subject.name || "Untitled Subject",

    icon: subject.icon || "subjects",

    color: subject.color || colorForIndex(index),
  };
}

function normalizeNote(note, subjectId = null) {
  return {
    ...note,

    id: note.id,

    subjectId: note.subjectId ?? subjectId ?? null,

    title: note.title || "Untitled Note",

    content: note.content || "",

    createdAt: note.createdAt ?? note.created_at ?? Date.now(),

    updatedAt: note.updatedAt ?? note.updated_at ?? null,
  };
}

function normalizeFlashcard(flashcard, subjectId = null) {
  return {
    ...flashcard,

    id: flashcard.id,

    subjectId: flashcard.subjectId ?? subjectId ?? null,

    front: flashcard.front || "",

    back: flashcard.back || "",

    createdAt: flashcard.createdAt ?? flashcard.created_at ?? Date.now(),

    updatedAt: flashcard.updatedAt ?? flashcard.updated_at ?? null,
  };
}

function normalizeQuiz(quiz, subjectId = null) {
  return {
    ...quiz,

    id: quiz.id,

    subjectId: quiz.subjectId ?? subjectId ?? null,

    title: quiz.title || "Untitled Quiz",

    questions: Array.isArray(quiz.questions)
      ? quiz.questions.map((question, index) => ({
          ...question,

          id: question.id ?? String(index + 1),

          question: question.question || "",

          options: Array.isArray(question.options)
            ? question.options.map((option) => option ?? "")
            : [],

          correctAnswer: Number(question.correctAnswer ?? 0),

          explanation: question.explanation || "",
        }))
      : [],

    createdAt: quiz.createdAt ?? quiz.created_at ?? Date.now(),

    updatedAt: quiz.updatedAt ?? quiz.updated_at ?? null,
  };
}

// ==================================================
// PROVIDER
// ==================================================

export function StudyDataProvider({ children }) {
  // ==================================================
  // STATE
  // ==================================================

  const [subjects, setSubjects] = useState(INITIAL_SUBJECTS);

  const [notes, setNotes] = useState(INITIAL_NOTES);

  const [flashcards, setFlashcards] = useState(INITIAL_FLASHCARDS);

  const [quizzes, setQuizzes] = useState(INITIAL_QUIZZES);

  const [tasks, setTasks] = useState(INITIAL_TASKS);

  const [practiceExercises, setPracticeExercises] = useState(INITIAL_PRACTICE);

  // ==================================================
  // LOADING
  // ==================================================

  const [subjectsLoading, setSubjectsLoading] = useState(true);

  const [notesLoading, setNotesLoading] = useState(false);

  const [flashcardsLoading, setFlashcardsLoading] = useState(false);

  const [quizzesLoading, setQuizzesLoading] = useState(false);

  // ==================================================
  // ERRORS
  // ==================================================

  const [subjectsError, setSubjectsError] = useState("");

  const [notesError, setNotesError] = useState("");

  const [flashcardsError, setFlashcardsError] = useState("");

  const [quizzesError, setQuizzesError] = useState("");

  // ==================================================
  // LOAD SUBJECTS
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

  // ==================================================
  // LOAD NOTES
  // ==================================================

  const loadNotes = async () => {
    if (!auth.currentUser) {
      setNotes([]);
      setNotesLoading(false);

      return;
    }

    setNotesLoading(true);
    setNotesError("");

    try {
      const subjectsData = await getSubjectsApi();

      const normalizedSubjects = Array.isArray(subjectsData)
        ? subjectsData.map((subject, index) => normalizeSubject(subject, index))
        : [];

      setSubjects(normalizedSubjects);

      const subjectNoteResults = await Promise.all(
        normalizedSubjects.map(async (subject) => {
          const data = await getNotesApi(subject.id);

          if (!Array.isArray(data)) {
            return [];
          }

          return data.map((note) => normalizeNote(note, subject.id));
        }),
      );

      setNotes(subjectNoteResults.flat());
    } catch (error) {
      console.error("Failed to load notes:", error);

      setNotesError(error?.message || "Failed to load notes.");
    } finally {
      setNotesLoading(false);
    }
  };

  // ==================================================
  // LOAD FLASHCARDS
  // ==================================================

  const loadFlashcards = async () => {
    if (!auth.currentUser) {
      setFlashcards([]);
      setFlashcardsLoading(false);

      return;
    }

    setFlashcardsLoading(true);
    setFlashcardsError("");

    try {
      const subjectsData = await getSubjectsApi();

      const normalizedSubjects = Array.isArray(subjectsData)
        ? subjectsData.map((subject, index) => normalizeSubject(subject, index))
        : [];

      setSubjects(normalizedSubjects);

      const subjectFlashcardResults = await Promise.all(
        normalizedSubjects.map(async (subject) => {
          const data = await getFlashcardsApi(subject.id);

          if (!Array.isArray(data)) {
            return [];
          }

          return data.map((flashcard) =>
            normalizeFlashcard(flashcard, subject.id),
          );
        }),
      );

      setFlashcards(subjectFlashcardResults.flat());
    } catch (error) {
      console.error("Failed to load flashcards:", error);

      setFlashcardsError(error?.message || "Failed to load flashcards.");
    } finally {
      setFlashcardsLoading(false);
    }
  };

  // ==================================================
  // LOAD QUIZZES
  // ==================================================

  const loadQuizzes = async () => {
    if (!auth.currentUser) {
      setQuizzes([]);
      setQuizzesLoading(false);

      return;
    }

    setQuizzesLoading(true);
    setQuizzesError("");

    try {
      const subjectsData = await getSubjectsApi();

      const normalizedSubjects = Array.isArray(subjectsData)
        ? subjectsData.map((subject, index) => normalizeSubject(subject, index))
        : [];

      setSubjects(normalizedSubjects);

      const subjectQuizResults = await Promise.all(
        normalizedSubjects.map(async (subject) => {
          try {
            const data = await getQuizzesApi(subject.id);

            if (!Array.isArray(data)) {
              return [];
            }

            return data.map((quiz) => normalizeQuiz(quiz, subject.id));
          } catch (error) {
            console.error(
              `Failed to load quizzes for subject ${subject.id}:`,
              error,
            );

            return [];
          }
        }),
      );

      setQuizzes(subjectQuizResults.flat());
    } catch (error) {
      console.error("Failed to load quizzes:", error);

      setQuizzesError(error?.message || "Failed to load quizzes.");
    } finally {
      setQuizzesLoading(false);
    }
  };

  // ==================================================
  // AUTH INITIALIZATION
  // ==================================================

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!isMounted) {
        return;
      }

      // ------------------------------------------
      // LOGGED OUT
      // ------------------------------------------

      if (!user) {
        setSubjects([]);
        setNotes([]);
        setFlashcards([]);
        setQuizzes([]);
        setTasks([]);
        setPracticeExercises([]);

        setSubjectsError("");
        setNotesError("");
        setFlashcardsError("");
        setQuizzesError("");

        setSubjectsLoading(false);
        setNotesLoading(false);
        setFlashcardsLoading(false);
        setQuizzesLoading(false);

        return;
      }

      // ------------------------------------------
      // LOGGED IN
      // ------------------------------------------

      setSubjectsLoading(true);
      setNotesLoading(true);
      setFlashcardsLoading(true);
      setQuizzesLoading(true);

      setSubjectsError("");
      setNotesError("");
      setFlashcardsError("");
      setQuizzesError("");

      try {
        // ----------------------------------------
        // Load subjects
        // ----------------------------------------

        const subjectsData = await getSubjectsApi();

        if (!isMounted) {
          return;
        }

        const normalizedSubjects = Array.isArray(subjectsData)
          ? subjectsData.map((subject, index) =>
              normalizeSubject(subject, index),
            )
          : [];

        setSubjects(normalizedSubjects);

        // ----------------------------------------
        // Load notes
        // ----------------------------------------

        const subjectNoteResults = await Promise.all(
          normalizedSubjects.map(async (subject) => {
            try {
              const subjectNotes = await getNotesApi(subject.id);

              if (!Array.isArray(subjectNotes)) {
                return [];
              }

              return subjectNotes.map((note) =>
                normalizeNote(note, subject.id),
              );
            } catch (error) {
              console.error(
                `Failed to load notes for subject ${subject.id}:`,
                error,
              );

              return [];
            }
          }),
        );

        if (!isMounted) {
          return;
        }

        setNotes(subjectNoteResults.flat());

        // ----------------------------------------
        // Load flashcards
        // ----------------------------------------

        const subjectFlashcardResults = await Promise.all(
          normalizedSubjects.map(async (subject) => {
            try {
              const subjectFlashcards = await getFlashcardsApi(subject.id);

              if (!Array.isArray(subjectFlashcards)) {
                return [];
              }

              return subjectFlashcards.map((flashcard) =>
                normalizeFlashcard(flashcard, subject.id),
              );
            } catch (error) {
              console.error(
                `Failed to load flashcards for subject ${subject.id}:`,
                error,
              );

              return [];
            }
          }),
        );

        if (!isMounted) {
          return;
        }

        setFlashcards(subjectFlashcardResults.flat());

        // ----------------------------------------
        // Load quizzes
        // ----------------------------------------

        const subjectQuizResults = await Promise.all(
          normalizedSubjects.map(async (subject) => {
            try {
              const subjectQuizzes = await getQuizzesApi(subject.id);

              if (!Array.isArray(subjectQuizzes)) {
                return [];
              }

              return subjectQuizzes.map((quiz) =>
                normalizeQuiz(quiz, subject.id),
              );
            } catch (error) {
              console.error(
                `Failed to load quizzes for subject ${subject.id}:`,
                error,
              );

              return [];
            }
          }),
        );

        if (!isMounted) {
          return;
        }

        setQuizzes(subjectQuizResults.flat());
      } catch (error) {
        if (!isMounted) {
          return;
        }

        console.error("Failed to load study data:", error);

        const message = error?.message || "Failed to load study data.";

        setSubjectsError(message);
        setNotesError(message);
        setFlashcardsError(message);
        setQuizzesError(message);
      } finally {
        if (isMounted) {
          setSubjectsLoading(false);
          setNotesLoading(false);
          setFlashcardsLoading(false);
          setQuizzesLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // ==================================================
  // SUBJECTS
  // ==================================================

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

    const subjectIndex = subjects.findIndex(
      (subject) => String(subject.id) === String(id),
    );

    const normalizedSubject = normalizeSubject(
      updatedSubject,
      subjectIndex >= 0 ? subjectIndex : 0,
    );

    setSubjects((prev) =>
      prev.map((subject) =>
        String(subject.id) === String(id) ? normalizedSubject : subject,
      ),
    );

    return normalizedSubject;
  };

  const deleteSubject = async (id) => {
    await deleteSubjectApi(id);

    setSubjects((prev) =>
      prev.filter((subject) => String(subject.id) !== String(id)),
    );

    setNotes((prev) =>
      prev.filter((note) => String(note.subjectId) !== String(id)),
    );

    setFlashcards((prev) =>
      prev.filter((card) => String(card.subjectId) !== String(id)),
    );

    setQuizzes((prev) =>
      prev.filter((quiz) => String(quiz.subjectId) !== String(id)),
    );

    setPracticeExercises((prev) =>
      prev.filter((practice) => String(practice.subjectId) !== String(id)),
    );
  };

  // ==================================================
  // NOTES
  // ==================================================

  const addNote = async ({ subjectId, title, content }) => {
    if (!subjectId) {
      throw new Error("A subject is required.");
    }

    const trimmedTitle = title?.trim();

    const trimmedContent = content?.trim();

    if (!trimmedTitle) {
      throw new Error("Note title is required.");
    }

    if (!trimmedContent) {
      throw new Error("Note content is required.");
    }

    const createdNote = await createNoteApi(subjectId, {
      title: trimmedTitle,
      content: trimmedContent,
    });

    const normalizedNote = normalizeNote(createdNote, subjectId);

    setNotes((prev) => [normalizedNote, ...prev]);

    return normalizedNote;
  };

  const updateNote = async (id, { subjectId, title, content }) => {
    const existingNote = notes.find((note) => String(note.id) === String(id));

    const resolvedSubjectId = subjectId ?? existingNote?.subjectId;

    if (!resolvedSubjectId) {
      throw new Error("A subject is required before updating a note.");
    }

    const payload = {
      title: title !== undefined ? title.trim() : undefined,

      content: content !== undefined ? content : undefined,
    };

    try {
      const updatedNote = await updateNoteApi(resolvedSubjectId, id, payload);

      const normalizedNote = normalizeNote(updatedNote, resolvedSubjectId);

      setNotes((prev) =>
        prev.map((note) =>
          String(note.id) === String(id) ? normalizedNote : note,
        ),
      );

      return normalizedNote;
    } catch (error) {
      console.error("Failed to update note:", error);

      throw error;
    }
  };

  const deleteNote = async (id) => {
    const existingNote = notes.find((note) => String(note.id) === String(id));

    if (!existingNote) {
      return;
    }

    if (!existingNote.subjectId) {
      throw new Error("Cannot delete note because its subject is missing.");
    }

    try {
      await deleteNoteApi(existingNote.subjectId, id);

      setNotes((prev) => prev.filter((note) => String(note.id) !== String(id)));
    } catch (error) {
      console.error("Failed to delete note:", error);

      throw error;
    }
  };

  // ==================================================
  // FLASHCARDS
  // ==================================================

  const addFlashcard = async ({ subjectId, front, back }) => {
    if (!subjectId) {
      throw new Error("A subject is required.");
    }

    const trimmedFront = front?.trim();

    const trimmedBack = back?.trim();

    if (!trimmedFront) {
      throw new Error("Flashcard front is required.");
    }

    if (!trimmedBack) {
      throw new Error("Flashcard back is required.");
    }

    const createdFlashcard = await createFlashcardApi(subjectId, {
      front: trimmedFront,
      back: trimmedBack,
    });

    const normalizedFlashcard = normalizeFlashcard(createdFlashcard, subjectId);

    setFlashcards((prev) => [normalizedFlashcard, ...prev]);

    return normalizedFlashcard;
  };

  const updateFlashcard = async ({ id, subjectId, front, back }) => {
    if (!subjectId) {
      throw new Error("A subject is required before updating a flashcard.");
    }

    if (!id) {
      throw new Error("A flashcard ID is required before updating.");
    }

    const updatedFlashcard = await updateFlashcardApi(
      String(subjectId),
      String(id),
      {
        front: front?.trim() ?? "",

        back: back?.trim() ?? "",
      },
    );

    const normalizedFlashcard = normalizeFlashcard(updatedFlashcard, subjectId);

    setFlashcards((prev) =>
      prev.map((flashcard) =>
        String(flashcard.id) === String(id) ? normalizedFlashcard : flashcard,
      ),
    );

    return normalizedFlashcard;
  };

  const deleteFlashcard = async (id) => {
    const existingFlashcard = flashcards.find(
      (card) => String(card.id) === String(id),
    );

    if (!existingFlashcard) {
      return;
    }

    if (!existingFlashcard.subjectId) {
      throw new Error(
        "Cannot delete flashcard because its subject is missing.",
      );
    }

    try {
      await deleteFlashcardApi(existingFlashcard.subjectId, id);

      setFlashcards((prev) =>
        prev.filter((card) => String(card.id) !== String(id)),
      );
    } catch (error) {
      console.error("Failed to delete flashcard:", error);

      throw error;
    }
  };

  // ==================================================
  // QUIZZES
  // ==================================================

  const addQuiz = async ({ subjectId, title, questions }) => {
    if (!subjectId) {
      throw new Error("A subject is required.");
    }

    const trimmedTitle = title?.trim();

    if (!trimmedTitle) {
      throw new Error("Quiz title is required.");
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error("A quiz must contain at least one question.");
    }

    const payload = {
      title: trimmedTitle,

      questions: questions.map((question) => ({
        question: question.question?.trim() || "",

        options: Array.isArray(question.options)
          ? question.options.map((option) => option?.trim() || "")
          : [],

        correctAnswer: Number(question.correctAnswer ?? 0),

        explanation: question.explanation?.trim() || "",
      })),
    };

    const createdQuiz = await createQuizApi(subjectId, payload);

    const normalizedQuiz = normalizeQuiz(createdQuiz, subjectId);

    setQuizzes((prev) => [normalizedQuiz, ...prev]);

    return normalizedQuiz;
  };

  const updateQuiz = async (id, { subjectId, title, questions }) => {
    const existingQuiz = quizzes.find((quiz) => String(quiz.id) === String(id));

    const resolvedSubjectId = subjectId ?? existingQuiz?.subjectId;

    if (!resolvedSubjectId) {
      throw new Error("A subject is required before updating a quiz.");
    }

    if (!id) {
      throw new Error("A quiz ID is required before updating.");
    }

    const payload = {
      title: title !== undefined ? title.trim() : undefined,

      questions:
        questions !== undefined
          ? questions.map((question) => ({
              id: question.id ?? undefined,

              question: question.question?.trim() || "",

              options: Array.isArray(question.options)
                ? question.options.map((option) => option?.trim() || "")
                : [],

              correctAnswer: Number(question.correctAnswer ?? 0),

              explanation: question.explanation?.trim() || "",
            }))
          : undefined,
    };

    const updatedQuiz = await updateQuizApi(resolvedSubjectId, id, payload);

    const normalizedQuiz = normalizeQuiz(updatedQuiz, resolvedSubjectId);

    setQuizzes((prev) =>
      prev.map((quiz) =>
        String(quiz.id) === String(id) ? normalizedQuiz : quiz,
      ),
    );

    return normalizedQuiz;
  };

  const deleteQuiz = async (id) => {
    const existingQuiz = quizzes.find((quiz) => String(quiz.id) === String(id));

    if (!existingQuiz) {
      return;
    }

    if (!existingQuiz.subjectId) {
      throw new Error("Cannot delete quiz because its subject is missing.");
    }

    try {
      await deleteQuizApi(existingQuiz.subjectId, id);

      setQuizzes((prev) =>
        prev.filter((quiz) => String(quiz.id) !== String(id)),
      );
    } catch (error) {
      console.error("Failed to delete quiz:", error);

      throw error;
    }
  };

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
  // UPLOAD / AI GENERATION
  // ==================================================

  const generateAssetsFromUpload = async ({
    file,
    subjectId,
    instructions = "",
  }) => {
    if (!file) {
      throw new Error("A study file is required.");
    }

    if (!subjectId) {
      throw new Error("A subject is required.");
    }

    try {
      // ==================================================
      // 1. GENERATE STUDY MATERIALS
      // ==================================================

      const generatedData = await generateStudyFromFile({
        subjectId: String(subjectId),
        file,
        instructions,
      });

      console.log("Study materials generated successfully:", generatedData);

      // ==================================================
      // 2. SAVE NOTE
      // ==================================================

      let savedNote = null;

      if (
        generatedData.noteTitle?.trim() &&
        generatedData.noteContent?.trim()
      ) {
        savedNote = await addNote({
          subjectId: String(subjectId),

          title: generatedData.noteTitle.trim(),

          content: generatedData.noteContent.trim(),
        });
      }

      // ==================================================
      // 3. SAVE FLASHCARDS
      // ==================================================

      const savedFlashcards = [];

      if (Array.isArray(generatedData.flashcards)) {
        for (const flashcard of generatedData.flashcards) {
          if (!flashcard?.front?.trim() || !flashcard?.back?.trim()) {
            continue;
          }

          const savedFlashcard = await addFlashcard({
            subjectId: String(subjectId),

            front: flashcard.front.trim(),

            back: flashcard.back.trim(),
          });

          savedFlashcards.push(savedFlashcard);
        }
      }

      // ==================================================
      // 4. SAVE QUIZ
      // ==================================================

      let savedQuiz = null;

      if (Array.isArray(generatedData.quiz) && generatedData.quiz.length > 0) {
        const baseTitle =
          file.name?.replace(/\.[^/.]+$/, "").trim() || "Generated Study";

        const quizQuestions = generatedData.quiz
          .filter(
            (question) =>
              question?.question?.trim() &&
              Array.isArray(question.options) &&
              question.options.length === 4 &&
              Number.isInteger(Number(question.correctAnswer)),
          )
          .map((question) => ({
            question: question.question.trim(),

            options: question.options.map((option) =>
              String(option ?? "").trim(),
            ),

            correctAnswer: Number(question.correctAnswer),

            explanation: question.explanation?.trim() || "",
          }));

        if (quizQuestions.length > 0) {
          savedQuiz = await addQuiz({
            subjectId: String(subjectId),

            title: `${baseTitle} Quiz`,

            questions: quizQuestions,
          });
        }
      }

      // ==================================================
      // 5. PRACTICE
      // ==================================================
      //
      // Practice persistence will be added after
      // the Practice CRUD backend is implemented.
      //

      // ==================================================
      // 6. RESULT
      // ==================================================

      const result = {
        ...generatedData,

        savedNote,

        savedFlashcards,

        savedQuiz,
      };

      console.log("Generated study materials saved:", result);

      return result;
    } catch (error) {
      console.error("Failed to generate and save study materials:", error);

      throw error;
    }
  };

  // ==================================================
  // CONTEXT VALUE
  // ==================================================

  const value = {
    // ------------------------------------------
    // Subjects
    // ------------------------------------------

    subjects,

    subjectsLoading,

    subjectsError,

    loadSubjects,

    addSubject,

    updateSubject,

    deleteSubject,

    // ------------------------------------------
    // Notes
    // ------------------------------------------

    notes,

    notesLoading,

    notesError,

    loadNotes,

    addNote,

    updateNote,

    deleteNote,

    // ------------------------------------------
    // Flashcards
    // ------------------------------------------

    flashcards,

    flashcardsLoading,

    flashcardsError,

    loadFlashcards,

    addFlashcard,

    updateFlashcard,

    deleteFlashcard,

    // ------------------------------------------
    // Quizzes
    // ------------------------------------------

    quizzes,

    quizzesLoading,

    quizzesError,

    loadQuizzes,

    addQuiz,

    updateQuiz,

    deleteQuiz,

    // ------------------------------------------
    // Tasks
    // ------------------------------------------

    tasks,

    addTask,

    toggleTask,

    deleteTask,

    // ------------------------------------------
    // Practice
    // ------------------------------------------

    practiceExercises,

    togglePracticeComplete,

    // ------------------------------------------
    // AI Upload
    // ------------------------------------------

    generateAssetsFromUpload,
  };

  return (
    <StudyDataContext.Provider value={value}>
      {children}
    </StudyDataContext.Provider>
  );
}

// ==================================================
// HOOK
// ==================================================

export function useStudyData() {
  const ctx = useContext(StudyDataContext);

  if (!ctx) {
    throw new Error("useStudyData must be used within a StudyDataProvider");
  }

  return ctx;
}

export default StudyDataContext;
