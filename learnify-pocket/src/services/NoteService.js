import {
    authorizedFetch,
    handleApiResponse,
} from "./apiClient";

export async function getNotes(
    subjectId
) {
    const response =
        await authorizedFetch(
            `/subjects/${subjectId}/notes`
        );

    return handleApiResponse(
        response
    );
}

export async function getNote(
    subjectId,
    noteId
) {
    const response =
        await authorizedFetch(
            `/subjects/${subjectId}/notes/${noteId}`
        );

    return handleApiResponse(
        response
    );
}

export async function createNote(
    subjectId,
    note
) {
    const response =
        await authorizedFetch(
            `/subjects/${subjectId}/notes`,
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json",
                },
                body: JSON.stringify(
                    note
                ),
            }
        );

    return handleApiResponse(
        response
    );
}

export async function updateNote(
    subjectId,
    noteId,
    note
) {
    const response =
        await authorizedFetch(
            `/subjects/${subjectId}/notes/${noteId}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type":
                        "application/json",
                },
                body: JSON.stringify(
                    note
                ),
            }
        );

    return handleApiResponse(
        response
    );
}

export async function deleteNote(
    subjectId,
    noteId
) {
    const response =
        await authorizedFetch(
            `/subjects/${subjectId}/notes/${noteId}`,
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