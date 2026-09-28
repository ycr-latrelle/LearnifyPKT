import { auth } from "../config/firebase";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
    throw new Error(
        "VITE_API_BASE_URL is not configured."
    );
}

/**
 * Performs an authenticated API request.
 *
 * Automatically:
 * - Gets the current Firebase user
 * - Gets a Firebase ID token
 * - Adds the Authorization header
 * - Retries once with a refreshed token if the API returns 401
 */
export async function authorizedFetch(
    path,
    options = {}
) {
    const firebaseUser = auth.currentUser;

    if (!firebaseUser) {
        throw new Error(
            "No authenticated Firebase user."
        );
    }

    let idToken =
        await firebaseUser.getIdToken();

    const makeRequest = async (token) => {
        const headers = new Headers(
            options.headers || {}
        );

        headers.set(
            "Authorization",
            `Bearer ${token}`
        );

        return fetch(
            `${API_BASE_URL}${path}`,
            {
                ...options,
                headers,
            }
        );
    };

    let response =
        await makeRequest(idToken);

    // Firebase ID tokens can expire.
    // Refresh once if the API rejects the token.
    if (response.status === 401) {
        idToken =
            await firebaseUser.getIdToken(true);

        response =
            await makeRequest(idToken);
    }

    return response;
}

/**
 * Handles JSON API responses consistently.
 */
export async function handleApiResponse(
    response
) {
    const contentType =
        response.headers.get(
            "content-type"
        ) || "";

    const data =
        contentType.includes(
            "application/json"
        )
            ? await response.json()
            : await response.text();

    if (!response.ok) {
        const message =
            typeof data === "object" &&
            data?.message
                ? data.message
                : typeof data === "string" &&
                  data
                    ? data
                    : `API request failed with status ${response.status}.`;

        throw new Error(message);
    }

    return data;
}