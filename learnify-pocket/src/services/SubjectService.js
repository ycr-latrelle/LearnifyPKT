import {
  authorizedFetch,
  handleApiResponse,
} from "./apiClient";

// Get all subjects belonging to the authenticated user.
export async function getSubjects() {
  const response = await authorizedFetch("/subjects");

  return handleApiResponse(response);
}

// Get one subject.
export async function getSubject(subjectId) {
  const response = await authorizedFetch(
    `/subjects/${encodeURIComponent(subjectId)}`
  );

  return handleApiResponse(response);
}

// Create a new subject.
export async function createSubject(subject) {
  const response = await authorizedFetch("/subjects", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(subject),
  });

  return handleApiResponse(response);
}

// Update an existing subject.
export async function updateSubject(subjectId, subject) {
  const response = await authorizedFetch(
    `/subjects/${encodeURIComponent(subjectId)}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(subject),
    }
  );

  return handleApiResponse(response);
}

// Delete a subject.
export async function deleteSubject(subjectId) {
  const response = await authorizedFetch(
    `/subjects/${encodeURIComponent(subjectId)}`,
    {
      method: "DELETE",
    }
  );

  return handleApiResponse(response);
}