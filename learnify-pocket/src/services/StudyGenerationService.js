import {
  authorizedFetch,
  handleApiResponse,
} from "./apiClient";

export async function generateStudyFromFile({
  subjectId,
  file,
  instructions = "",
}) {
  if (!subjectId) {
    throw new Error("A subject is required.");
  }

  if (!file) {
    throw new Error("A study file is required.");
  }

  const formData = new FormData();

  formData.append(
    "SubjectId",
    String(subjectId),
  );

  formData.append("File", file);

  if (instructions?.trim()) {
    formData.append(
      "Instructions",
      instructions.trim(),
    );
  }

  const response = await authorizedFetch(
    "/study/generate-from-file",
    {
      method: "POST",
      body: formData,
    },
  );

  return handleApiResponse(response);
}