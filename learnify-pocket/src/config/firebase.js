import { initializeApp } from "firebase/app";

import {
    getAuth,
    setPersistence,
    browserLocalPersistence,
} from "firebase/auth";

const firebaseConfig = {
    apiKey:
        import.meta.env.VITE_FIREBASE_API_KEY,

    authDomain:
        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,

    databaseURL:
        import.meta.env.VITE_FIREBASE_DATABASE_URL,

    projectId:
        import.meta.env.VITE_FIREBASE_PROJECT_ID,

    storageBucket:
        import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,

    messagingSenderId:
        import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,

    appId:
        import.meta.env.VITE_FIREBASE_APP_ID,

    measurementId:
        import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app =
    initializeApp(firebaseConfig);

export const auth =
    getAuth(app);

/*
 * Explicitly persist Firebase authentication
 * in the browser's local storage.
 *
 * This allows the authentication session
 * to survive page refreshes and browser restarts.
 */
setPersistence(
    auth,
    browserLocalPersistence
).catch((error) => {
    console.error(
        "Firebase persistence setup failed:",
        error
    );
});

export default app;
