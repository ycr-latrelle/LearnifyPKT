import {
  authorizedFetch,
  handleApiResponse,
} from "./apiClient";

// ==================================================
// GET ALL QUIZZES FOR A SUBJECT
// ==================================================

export async function getQuizzes(subjectId) {
  if (!subjectId) {
    throw new Error("A subject is required.");
  }

  const response = await authorizedFetch(
    `/subjects/${subjectId}/quizzes`,
  );

  return handleApiResponse(response);
}

// ==================================================
// GET SINGLE QUIZ
// ==================================================

export async function getQuiz(
  subjectId,
  quizId,
) {
  if (!subjectId) {
    throw new Error("A subject is required.");
  }

  if (!quizId) {
    throw new Error("A quiz ID is required.");
  }

  const response = await authorizedFetch(
    `/subjects/${subjectId}/quizzes/${quizId}`,
  );

  return handleApiResponse(response);
}

// ==================================================
// CREATE QUIZ
// ==================================================

export async function createQuiz(
  subjectId,
  quiz,
) {
  if (!subjectId) {
    throw new Error("A subject is required.");
  }

  const response = await authorizedFetch(
    `/subjects/${subjectId}/quizzes`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(quiz),
    },
  );

  return handleApiResponse(response);
}

// ==================================================
// UPDATE QUIZ
// ==================================================

export async function updateQuiz(
  subjectId,
  quizId,
  quiz,
) {
  if (!subjectId) {
    throw new Error("A subject is required.");
  }

  if (!quizId) {
    throw new Error("A quiz ID is required.");
  }

  const response = await authorizedFetch(
    `/subjects/${subjectId}/quizzes/${quizId}`,
    {
      method: "PUT",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(quiz),
    },
  );

  return handleApiResponse(response);
}

// ==================================================
// DELETE QUIZ
// ==================================================

export async function deleteQuiz(
  subjectId,
  quizId,
) {
  if (!subjectId) {
    throw new Error("A subject is required.");
  }

  if (!quizId) {
    throw new Error("A quiz ID is required.");
  }

  const response = await authorizedFetch(
    `/subjects/${subjectId}/quizzes/${quizId}`,
    {
      method: "DELETE",
    },
  );

  if (response.status === 204) {
    return true;
  }

  await handleApiResponse(response);

  return true;
}
