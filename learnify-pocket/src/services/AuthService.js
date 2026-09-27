import {
    GoogleAuthProvider,
    signInWithPopup,
    signInWithEmailAndPassword,
} from "firebase/auth";

import { auth } from "../config/firebase";

const API_BASE_URL = "http://localhost:5166/api";

async function handleResponse(response) {
    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Something went wrong."
        );
    }

    return data;
}

// ==================================================
// REGISTER
// ==================================================

export async function registerUser(
    name,
    email,
    password
) {
    const response = await fetch(
        `${API_BASE_URL}/auth/register`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name,
                email,
                password,
            }),
        }
    );

    return handleResponse(response);
}

// ==================================================
// VERIFY EMAIL
// ==================================================

export async function verifyEmail(
    uid,
    otp
) {
    const response = await fetch(
        `${API_BASE_URL}/auth/verify-email`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                uid,
                otp,
            }),
        }
    );

    return handleResponse(response);
}

// ==================================================
// RESEND VERIFICATION
// ==================================================

export async function resendVerification(
    uid
) {
    const response = await fetch(
        `${API_BASE_URL}/auth/resend-verification`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                uid,
            }),
        }
    );

    return handleResponse(response);
}

// ==================================================
// LOGIN
// ==================================================

export async function loginUser(email, password) {
    try {
        // Sign in to Firebase Client Authentication
        const credential =
            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

        const firebaseUser =
            credential.user;

        // Get Firebase ID token
        const idToken =
            await firebaseUser.getIdToken();

        // Send token to ASP.NET backend
        const response = await fetch(
            `${API_BASE_URL}/auth/login`,
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json",
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
            }
        );

        const result =
            await handleResponse(response);

        if (!result.success) {
            // If backend rejects the login,
            // remove the Firebase client session.
            await auth.signOut();

            return result;
        }

        // Make sure the backend result has the
        // current Firebase ID token.
        result.idToken = idToken;

        return result;

    } catch (error) {
        console.error(
            "Login error:",
            error
        );

        if (
            error.code ===
            "auth/invalid-credential"
        ) {
            return {
                success: false,
                message:
                    "INVALID EMAIL OR PASSWORD.",
            };
        }

        if (
            error.code ===
            "auth/user-not-found"
        ) {
            return {
                success: false,
                message:
                    "USER NOT FOUND.",
            };
        }

        if (
            error.code ===
            "auth/wrong-password"
        ) {
            return {
                success: false,
                message:
                    "INVALID PASSWORD.",
            };
        }

        if (
            error.code ===
            "auth/invalid-email"
        ) {
            return {
                success: false,
                message:
                    "INVALID EMAIL ADDRESS.",
            };
        }

        return {
            success: false,
            message:
                error.message ||
                "LOGIN FAILED.",
        };
    }
}

// ==================================================
// CURRENT USER
// ==================================================

export async function getCurrentUser(
    idToken
) {
    const response = await fetch(
        `${API_BASE_URL}/auth/me`,
        {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${idToken}`,
            },
        }
    );

    return handleResponse(response);
}

// ==================================================
// FORGOT PASSWORD
// ==================================================

export async function forgotPassword(
    email
) {
    const response = await fetch(
        `${API_BASE_URL}/auth/forgot-password`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
            }),
        }
    );

    return handleResponse(response);
}

// ==================================================
// VERIFY PASSWORD RESET OTP
// ==================================================

export async function verifyPasswordReset(
    email,
    otp
) {
    const response = await fetch(
        `${API_BASE_URL}/auth/verify-password-reset`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
                otp,
            }),
        }
    );

    return handleResponse(response);
}

// ==================================================
// RESET PASSWORD
// ==================================================

export async function resetPassword(
    email,
    resetToken,
    newPassword
) {
    const response = await fetch(
        `${API_BASE_URL}/auth/reset-password`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
                resetToken,
                newPassword,
            }),
        }
    );

    return handleResponse(response);
}

// ==================================================
// GOOGLE LOGIN
// ==================================================

export async function loginWithGoogle() {
    try {
        // Create Google provider
        const provider =
            new GoogleAuthProvider();

        // Open Google login popup
        const result =
            await signInWithPopup(
                auth,
                provider
            );

        // Get Firebase user
        const firebaseUser =
            result.user;

        // Get Firebase ID token
        const idToken =
            await firebaseUser.getIdToken();

        // Send ID token to ASP.NET backend
        const response = await fetch(
            `${API_BASE_URL}/auth/google`,
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json",
                },
                body: JSON.stringify({
                    idToken,
                }),
            }
        );

        // Return backend response
        return await handleResponse(
            response
        );

    } catch (error) {
        console.error(
            "Google login error:",
            error
        );

        // User closed the popup
        if (
            error.code ===
            "auth/popup-closed-by-user"
        ) {
            return {
                success: false,
                message:
                    "GOOGLE LOGIN WAS CANCELLED.",
            };
        }

        // Browser blocked popup
        if (
            error.code ===
            "auth/popup-blocked"
        ) {
            return {
                success: false,
                message:
                    "GOOGLE LOGIN POPUP WAS BLOCKED BY THE BROWSER.",
            };
        }

        // Email already belongs to another provider
        if (
            error.code ===
            "auth/account-exists-with-different-credential"
        ) {
            return {
                success: false,
                message:
                    "AN ACCOUNT WITH THIS EMAIL ALREADY EXISTS USING A DIFFERENT LOGIN METHOD.",
            };
        }

        // Other Firebase/API errors
        return {
            success: false,
            message:
                error.message ||
                "GOOGLE LOGIN FAILED.",
        };
    }
}