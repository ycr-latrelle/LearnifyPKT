import {
    authorizedFetch,
    handleApiResponse,
} from "./apiClient";

export async function getFlashcards(
    subjectId
) {
    const response =
        await authorizedFetch(
            `/subjects/${subjectId}/flashcards`
        );

    return handleApiResponse(
        response
    );
}

export async function getFlashcard(
    subjectId,
    flashcardId
) {
    const response =
        await authorizedFetch(
            `/subjects/${subjectId}/flashcards/${flashcardId}`
        );

    return handleApiResponse(
        response
    );
}

export async function createFlashcard(
    subjectId,
    flashcard
) {
    const response =
        await authorizedFetch(
            `/subjects/${subjectId}/flashcards`,
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json",
                },
                body: JSON.stringify(
                    flashcard
                ),
            }
        );

    return handleApiResponse(
        response
    );
}

export async function updateFlashcard(
    subjectId,
    flashcardId,
    flashcard
) {
    const response =
        await authorizedFetch(
            `/subjects/${subjectId}/flashcards/${flashcardId}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type":
                        "application/json",
                },
                body: JSON.stringify(
                    flashcard
                ),
            }
        );

    return handleApiResponse(
        response
    );
}

export async function deleteFlashcard(
    subjectId,
    flashcardId
) {
    const response =
        await authorizedFetch(
            `/subjects/${subjectId}/flashcards/${flashcardId}`,
            {
                method: "DELETE",
            }
        );

    if (response.status === 204) {
        return true;
    }

    await handleApiResponse(response);

    return true;
}