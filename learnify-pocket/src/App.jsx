import React from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

import AuthenticationCanvas from "./pages/Authentication Page/AuthenticationCanvas";
import DashboardPage from "./pages/Dashboard/DashboardPage";
import SubjectsPage from "./pages/Subjects/SubjectsPage";
import SubjectDetailPage from "./pages/Subjects/SubjectDetailPage";
import NotesPage from "./pages/Notes/NotesPage";
import AITutorPage from "./pages/Tutor/AITutorPage";
import FlashcardsPage from "./pages/Flashcards/FlashcardsPage";
import QuizPage from "./pages/Quiz/QuizPage";
import PracticePage from "./pages/Practice/PracticePage";
import ProgressPage from "./pages/Progress/ProgressPage";
import ProfilePage from "./pages/Profile/ProfilePage";

import { useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { StudyDataProvider } from "./context/StudyDataContext";

// ==================================================
// APPLICATION ROUTES
// ==================================================

const AppRoutes = () => {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  // ==================================================
  // WAIT FOR FIREBASE AUTHENTICATION
  // ==================================================

  /*
   * Firebase needs a moment to restore the existing
   * authentication session when the application loads.
   *
   * Do not redirect while this is happening.
   */

  if (loading) {
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Pixelify Sans', cursive, sans-serif",
          fontWeight: 700,
        }}
      >
        Loading...
      </div>
    );
  }

  // ==================================================
  // AUTH SUCCESS
  // ==================================================

  const handleAuthSuccess = () => {
    /*
     * AuthenticationCanvas handles the actual login
     * through AuthContext.
     *
     * Once authentication succeeds, navigate to the
     * dashboard.
     */

    navigate("/dashboard");
  };

  // ==================================================
  // ROUTES
  // ==================================================

  return (
    <Routes>
      {/* =================================================
          LOGIN
      ================================================= */}

      <Route
        path="/login"
        element={
          user ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <AuthenticationCanvas onAuthSuccess={handleAuthSuccess} />
          )
        }
      />

      {/* =================================================
          REGISTER
      ================================================= */}

      <Route
        path="/register"
        element={
          user ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <AuthenticationCanvas onAuthSuccess={handleAuthSuccess} />
          )
        }
      />

      {/* =================================================
          FORGOT PASSWORD
      ================================================= */}

      <Route
        path="/forgot-password"
        element={
          user ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <AuthenticationCanvas onAuthSuccess={handleAuthSuccess} />
          )
        }
      />

      {/* =================================================
          VERIFY OTP
      ================================================= */}

      <Route
        path="/verify-otp"
        element={
          user ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <AuthenticationCanvas onAuthSuccess={handleAuthSuccess} />
          )
        }
      />

      {/* =================================================
          PASSWORD RESET OTP
      ================================================= */}

      <Route
        path="/password-reset-otp"
        element={
          user ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <AuthenticationCanvas onAuthSuccess={handleAuthSuccess} />
          )
        }
      />

      {/* =================================================
          NEW PASSWORD
      ================================================= */}

      <Route
        path="/new-password"
        element={
          user ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <AuthenticationCanvas onAuthSuccess={handleAuthSuccess} />
          )
        }
      />

      {/* =================================================
          DASHBOARD
      ================================================= */}

      <Route
        path="/dashboard"
        element={
          user ? (
            /*
             * AppRoutes already has the authenticated
             * user from AuthContext.
             *
             * Pass it to DashboardPage instead of having
             * DashboardPage call useAuth() again.
             */
            <DashboardPage user={user} onLogout={logout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* =================================================
          SUBJECTS
      ================================================= */}

      <Route
        path="/subjects"
        element={user ? <SubjectsPage /> : <Navigate to="/login" replace />}
      />

      <Route
        path="/subjects/:subjectId"
        element={user ? <SubjectDetailPage /> : <Navigate to="/login" replace />}
      />

      {/* =================================================
          NOTES
      ================================================= */}

      <Route
        path="/notes"
        element={user ? <NotesPage /> : <Navigate to="/login" replace />}
      />

      {/* =================================================
          AI TUTOR
      ================================================= */}

      <Route
        path="/tutor"
        element={user ? <AITutorPage /> : <Navigate to="/login" replace />}
      />

      {/* =================================================
          FLASHCARDS
      ================================================= */}

      <Route
        path="/flashcards"
        element={user ? <FlashcardsPage /> : <Navigate to="/login" replace />}
      />

      {/* =================================================
          QUIZ CENTER
      ================================================= */}

      <Route
        path="/quiz"
        element={user ? <QuizPage /> : <Navigate to="/login" replace />}
      />

      {/* =================================================
          PRACTICE LAB
      ================================================= */}

      <Route
        path="/practice"
        element={user ? <PracticePage /> : <Navigate to="/login" replace />}
      />

      {/* =================================================
          PROGRESS STATS
      ================================================= */}

      <Route
        path="/progress"
        element={user ? <ProgressPage /> : <Navigate to="/login" replace />}
      />

      {/* =================================================
          PROFILE SETTINGS
      ================================================= */}

      <Route
        path="/profile"
        element={user ? <ProfilePage /> : <Navigate to="/login" replace />}
      />

      {/* =================================================
          DEFAULT ROUTE
      ================================================= */}

      <Route
        path="/"
        element={<Navigate to={user ? "/dashboard" : "/login"} replace />}
      />

      {/* =================================================
          UNKNOWN ROUTES
      ================================================= */}

      <Route
        path="*"
        element={<Navigate to={user ? "/dashboard" : "/login"} replace />}
      />
    </Routes>
  );
};

// ==================================================
// APP
// ==================================================

const App = () => {
  return (
    <ThemeProvider>
      <StudyDataProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </StudyDataProvider>
    </ThemeProvider>
  );
};

export default App;
