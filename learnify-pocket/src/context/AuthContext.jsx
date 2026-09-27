import React, { createContext, useContext, useEffect, useState } from "react";

import { onAuthStateChanged, signOut } from "firebase/auth";

import { auth } from "../config/firebase";

const AuthContext = createContext(null);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

console.log("AuthContext API_BASE_URL:", API_BASE_URL);

if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL is not configured.");
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    /*
     * Firebase automatically restores the
     * authenticated user after a page refresh.
     */
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("Firebase auth state:", firebaseUser);

      /*
       * No Firebase user means the user
       * is actually logged out.
       */
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        /*
         * Firebase restored the session.
         *
         * Get the current Firebase ID token.
         */
        const idToken = await firebaseUser.getIdToken();

        /*
         * Ask the ASP.NET API for the
         * application user profile.
         */
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });

        /*
         * If the API rejects the token,
         * do NOT immediately sign out Firebase.
         */
        if (!response.ok) {
          const errorText = await response.text();

          console.error("API /auth/me failed:", response.status, errorText);

          setUser(null);
          setLoading(false);

          return;
        }

        const data = await response.json();

        if (!data.success) {
          console.error("API /auth/me returned failure:", data);

          setUser(null);
          setLoading(false);

          return;
        }

        /*
         * Store the application user.
         */
        setUser(data);
      } catch (error) {
        console.error("Session restoration failed:", error);

        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  /*
   * Login
   *
   * Firebase authentication is already performed
   * by AuthService.js.
   *
   * This function simply loads the application
   * profile after successful authentication.
   */
  const login = async (authResult) => {
    if (!authResult?.success) {
      return;
    }

    try {
      const firebaseUser = auth.currentUser;

      if (!firebaseUser) {
        console.error("Firebase user is not available.");

        return;
      }

      const idToken = await firebaseUser.getIdToken();

      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();

        console.error("API /auth/me failed:", response.status, errorText);

        return;
      }

      const data = await response.json();

      if (!data.success) {
        console.error("Unable to retrieve user profile:", data);

        return;
      }

      setUser(data);
    } catch (error) {
      console.error("Unable to initialize user session:", error);
    }
  };

  /*
   * Logout
   */
  const logout = async () => {
    try {
      setUser(null);
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);

      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
};
