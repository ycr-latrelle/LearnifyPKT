import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LoginPage } from "./Login/LoginPage";
import { RegisterPage } from "./Registration/RegisterPage";

import { useAuth } from "../../context/AuthContext";

import {
  registerUser,
  loginUser,
  loginWithGoogle,
  verifyEmail,
  resendVerification,
  forgotPassword,
  verifyPasswordReset,
  resetPassword,
} from "../../services/AuthService";

export const Icon = ({ name, size = 18, className = "" }) => {
  const icons = {
    bot: (
      <path
        d="M12 2a2 2 0 0 1 2 2v2h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2V4a2 2 0 0 1 2-2zm-3 8h.01M15 10h.01M9 14h6"
        strokeWidth="2.5"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    ),

    eye: (
      <path
        d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"
        strokeWidth="2.5"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    ),

    eyeOff: (
      <path
        d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22"
        strokeWidth="2.5"
        strokeLinecap="square"
      />
    ),

    google: (
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09zM12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23zM5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63zM12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        strokeWidth="1"
        fill="currentColor"
      />
    ),

    check: (
      <path
        d="M20 6L9 17l-5-5"
        strokeWidth="3"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    ),

    arrowLeft: (
      <path
        d="M19 12H5M12 19l-7-7 7-7"
        strokeWidth="2.5"
        strokeLinecap="square"
      />
    ),
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      className={className}
    >
      {icons[name] || icons.bot}
    </svg>
  );
};

export const AuthenticationCanvas = ({
  onAuthSuccess = (u) => console.log("Auth Success:", u),
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  /*
   * Get the authentication state manager.
   *
   * AuthContext listens to Firebase authentication state
   * and restores the session after a page refresh.
   */
  const { login } = useAuth();

  const mode =
    location.pathname === "/register"
      ? "register"
      : location.pathname === "/forgot-password"
        ? "forgot"
        : location.pathname === "/password-reset-otp"
          ? "password-reset-otp"
          : location.pathname === "/new-password"
            ? "new-password"
            : location.pathname === "/verify-otp"
              ? "otp"
              : "login";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const {
    email: routeEmail,
    name: routeName,
    uid: routeUid,
    resetToken: routeResetToken,
  } = location.state || {};

  const [forgotEmail, setForgotEmail] = useState(routeEmail || "");
  const [resetToken, setResetToken] = useState(routeResetToken || "");

  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [resendTimer, setResendTimer] = useState(30);

  const otpRefs = useRef([]);

  useEffect(() => {
    let timer;

    if (mode === "otp" && resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((current) => current - 1);
      }, 1000);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [mode, resendTimer]);

  useEffect(() => {
    setError("");
    setSuccessMsg("");
  }, [mode]);

  const goTo = (path, state) => {
    navigate(path, state ? { state } : undefined);
  };

  // =========================================================
  // LOGIN
  // =========================================================

  const handleLogin = async (email, password) => {
    setError("");
    setSuccessMsg("");

    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      const result = await loginUser(email.trim(), password);

      if (!result.success) {
        setError(result.message || "LOGIN FAILED. CHECK CREDENTIALS.");
        return;
      }

      console.log("Login successful:", result);

      /*
       * Initialize the application session.
       *
       * Firebase keeps the authenticated user,
       * while AuthContext stores the application user.
       */
      await login(result);

      onAuthSuccess(result);
    } catch (err) {
      console.error("Login failed:", err);

      setError(err.message || "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // GOOGLE LOGIN
  // =========================================================

  const handleGoogleLogin = async () => {
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      console.log("Starting Google login...");

      const result = await loginWithGoogle();

      console.log("Google login result:", result);

      if (!result.success) {
        setError(result.message || "GOOGLE LOGIN FAILED.");
        return;
      }

      /*
       * Initialize the same application session
       * used by email/password login.
       */
      await login(result);

      onAuthSuccess(result);
    } catch (err) {
      console.error("Google login failed:", err);

      setError(err.message || "GOOGLE LOGIN FAILED.");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // REGISTRATION
  // =========================================================

  const handleRegister = async ({ name, email, password, confirmPassword }) => {
    setError("");
    setSuccessMsg("");

    if (!name.trim()) {
      setError("PLAYER NAME IS REQUIRED");
      return;
    }

    if (!email.trim()) {
      setError("VALID EMAIL IS REQUIRED");
      return;
    }

    if (password.length < 6) {
      setError("PASSWORD MUST BE AT LEAST 6 CHARACTERS");
      return;
    }

    if (password !== confirmPassword) {
      setError("PASSWORDS DO NOT MATCH");
      return;
    }

    setLoading(true);

    try {
      const result = await registerUser(name.trim(), email.trim(), password);

      if (!result.success) {
        setError(result.message || "REGISTRATION FAILED.");
        return;
      }

      const verificationState = {
        uid: result.uid,
        email: result.email,
        name: result.name,
      };

      setOtp(["", "", "", "", "", ""]);

      setResendTimer(30);

      goTo("/verify-otp", verificationState);
    } catch (err) {
      setError(err.message || "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // FORGOT PASSWORD
  // =========================================================

  const handleForgotPassword = async (e) => {
    e?.preventDefault();

    setError("");
    setSuccessMsg("");

    const email = forgotEmail.trim();

    if (!email) {
      setError("PLEASE ENTER YOUR EMAIL ADDRESS");
      return;
    }

    setLoading(true);

    try {
      const result = await forgotPassword(email);

      if (!result.success) {
        setError(result.message || "UNABLE TO SEND RESET CODE.");
        return;
      }

      setOtp(["", "", "", "", "", ""]);

      goTo("/password-reset-otp", {
        email,
      });
    } catch (err) {
      setError(err.message || "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // PASSWORD RESET OTP
  // =========================================================

  const handlePasswordResetOtp = async () => {
    const fullCode = otp.join("");

    if (fullCode.length !== 6) {
      setError("PLEASE ENTER ALL 6 DIGITS");
      return;
    }

    if (!routeEmail) {
      setError("PASSWORD RESET SESSION EXPIRED. PLEASE START AGAIN.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const result = await verifyPasswordReset(routeEmail, fullCode.trim());

      if (!result.success) {
        setError(result.message || "INVALID RESET CODE.");
        return;
      }

      setResetToken(result.resetToken);

      setOtp(["", "", "", "", "", ""]);

      goTo("/new-password", {
        email: routeEmail,
        resetToken: result.resetToken,
      });
    } catch (err) {
      setError(err.message || "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // RESET PASSWORD
  // =========================================================

  const handleResetPassword = async (e) => {
    e?.preventDefault();

    setError("");
    setSuccessMsg("");

    if (!newPassword) {
      setError("PLEASE ENTER A NEW PASSWORD.");
      return;
    }

    if (newPassword.length < 6) {
      setError("PASSWORD MUST BE AT LEAST 6 CHARACTERS.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError("PASSWORDS DO NOT MATCH.");
      return;
    }

    const activeResetToken = resetToken || routeResetToken;

    if (!routeEmail || !activeResetToken) {
      setError("PASSWORD RESET SESSION EXPIRED. PLEASE START AGAIN.");
      return;
    }

    setLoading(true);

    try {
      const result = await resetPassword(
        routeEmail,
        activeResetToken,
        newPassword,
      );

      if (!result.success) {
        setError(result.message || "UNABLE TO RESET PASSWORD.");
        return;
      }

      setSuccessMsg("PASSWORD RESET SUCCESSFULLY!");

      setResetToken("");
      setNewPassword("");
      setConfirmNewPassword("");

      setTimeout(() => {
        goTo("/login");
      }, 1000);
    } catch (err) {
      setError(err.message || "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // OTP INPUT
  // =========================================================

  const handleOtpChange = (index, value) => {
    value = value.replace(/\D/g, "");

    if (value.length > 1) {
      value = value[value.length - 1];
    }

    const next = [...otp];

    next[index] = value;

    setOtp(next);
    setError("");

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // =========================================================
  // VERIFY REGISTRATION EMAIL OTP
  // =========================================================

  const handleVerifyOtp = async () => {
    const fullCode = otp.join("");

    if (fullCode.length !== 6) {
      setError("PLEASE ENTER ALL 6 DIGITS");
      return;
    }

    if (!routeUid) {
      setError("VERIFICATION SESSION EXPIRED. PLEASE REGISTER AGAIN.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const result = await verifyEmail(routeUid, fullCode.trim());

      if (!result.success) {
        setError(result.message || "INVALID VERIFICATION CODE");
        return;
      }

      setSuccessMsg("EMAIL VERIFIED SUCCESSFULLY!");

      setTimeout(() => {
        onAuthSuccess(result);
      }, 500);
    } catch (err) {
      setError(err.message || "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // RESEND REGISTRATION EMAIL OTP
  // =========================================================

  const handleResend = async () => {
    if (!routeUid) {
      setError("VERIFICATION SESSION EXPIRED. PLEASE REGISTER AGAIN.");
      return;
    }

    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const result = await resendVerification(routeUid);

      if (!result.success) {
        setError(result.message || "UNABLE TO RESEND CODE.");
        return;
      }

      setResendTimer(30);

      setOtp(["", "", "", "", "", ""]);

      setSuccessMsg("NEW CODE SENT!");

      setTimeout(() => {
        otpRefs.current[0]?.focus();
      }, 0);
    } catch (err) {
      setError(err.message || "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // PAGE TITLES
  // =========================================================

  const titleByMode = {
    login: "PRESS START TO CONTINUE",

    register: "NEW PLAYER CREATION",

    forgot: "PASSWORD RECOVERY",

    otp: "VERIFY PLAYER OTP",

    "password-reset-otp": "RESET PASSWORD OTP",

    "new-password": "CREATE NEW PASSWORD",
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="w-full min-h-screen min-h-[100dvh] bg-slate-200 dark:bg-navy-950 flex items-center justify-center px-3 py-4 sm:p-6 font-pixel">
      <div className="w-full max-w-[360px] sm:max-w-[420px] lg:max-w-[440px] max-h-[calc(100vh-2rem)] max-h-[calc(100dvh-2rem)] overflow-y-auto bg-white dark:bg-navy-900 border-[3px] sm:border-4 border-slate-900 dark:border-slate-800 shadow-pixel-md sm:shadow-pixel-lg p-4 sm:p-6 flex flex-col gap-3 sm:gap-5">
        <div className="text-center flex flex-col items-center gap-1">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-pixelYellow-400 border-[3px] border-slate-900 text-slate-900 flex items-center justify-center text-xl sm:text-2xl font-bold shadow-pixel-sm shrink-0">
            👾
          </div>

          <h1 className="font-arcade text-xs sm:text-sm text-slate-900 dark:text-white uppercase tracking-tight pt-1">
            Learnify
            <span className="text-pixelBlue-500">PKT</span>
          </h1>

          <p className="text-[9px] sm:text-[11px] font-arcade text-pixelBlue-500 uppercase">
            {titleByMode[mode]}
          </p>
        </div>

        {error && (
          <div className="p-2.5 bg-pixelRed-500 text-white font-bold text-xs border-2 border-slate-900 text-center uppercase shadow-pixel-sm">
            ⚠️ {error}
          </div>
        )}

        {successMsg && (
          <div className="p-2.5 bg-pixelGreen-400 text-slate-900 font-bold text-xs border-2 border-slate-900 text-center uppercase shadow-pixel-sm">
            ✅ {successMsg}
          </div>
        )}

        {mode === "login" && (
          <LoginPage
            onLogin={handleLogin}
            onGoogleLogin={handleGoogleLogin}
            onSwitchToRegister={() => goTo("/register")}
            onForgotPassword={() => {
              setForgotEmail("");
              goTo("/forgot-password");
            }}
            loading={loading}
            error={null}
          />
        )}

        {mode === "register" && (
          <RegisterPage
            onRegister={handleRegister}
            onSwitchToLogin={() => goTo("/login")}
            loading={loading}
            error={null}
          />
        )}

        {mode === "forgot" && (
          <form
            onSubmit={handleForgotPassword}
            className="flex flex-col gap-3.5"
          >
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
              Enter your registered email address and we will send you a 6-digit
              verification code.
            </p>

            <div>
              <label className="block text-[10px] font-arcade uppercase text-slate-600 dark:text-slate-400 mb-1">
                RECOVERY EMAIL
              </label>

              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => {
                  setForgotEmail(e.target.value);
                  setError("");
                }}
                placeholder="player@learnify.io"
                autoComplete="email"
                className="w-full p-2.5 bg-slate-100 dark:bg-navy-800 border-2 border-slate-900 dark:border-slate-700 text-xs font-bold outline-none text-slate-900 dark:text-white focus:bg-white dark:focus:bg-navy-800 focus:border-pixelBlue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-pixelPurple-500 hover:opacity-90 text-white font-black text-xs border-2 border-slate-900 shadow-pixel-md active:translate-x-0.5 active:translate-y-0.5 uppercase transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "SENDING..." : "SEND RESET CODE"}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => goTo("/login")}
                className="text-xs font-bold text-pixelBlue-500 hover:underline uppercase flex items-center justify-center gap-1 mx-auto"
              >
                <Icon name="arrowLeft" size={14} />
                <span>BACK TO LOG IN</span>
              </button>
            </div>
          </form>
        )}

        {mode === "otp" && (
          <div className="flex flex-col gap-4">
            <p className="text-xs font-bold text-center text-slate-600 dark:text-slate-400">
              ENTER 6-DIGIT VERIFICATION CODE SENT TO
              <br />
              <span className="font-mono text-pixelBlue-500 font-black">
                {routeEmail || "user@learnify.io"}
              </span>
            </p>

            <div className="flex justify-between gap-1.5">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (otpRefs.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  autoComplete={idx === 0 ? "one-time-code" : "off"}
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  className="w-full max-w-11 aspect-[11/12] bg-slate-100 dark:bg-navy-800 border-2 border-slate-900 dark:border-slate-700 text-center font-arcade text-sm sm:text-base text-slate-900 dark:text-white outline-none focus:border-pixelBlue-500 focus:bg-white dark:focus:bg-navy-800 min-w-0"
                />
              ))}
            </div>

            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={loading || otp.join("").length !== 6}
              className="w-full py-3 bg-pixelGreen-400 hover:bg-pixelGreen-500 text-slate-900 font-black text-xs border-2 border-slate-900 shadow-pixel-md active:translate-x-0.5 active:translate-y-0.5 uppercase transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "VERIFYING..." : "VERIFY CODE & START"}
            </button>

            <div className="flex justify-between items-center text-xs font-bold pt-1">
              <button
                type="button"
                onClick={() => goTo("/login")}
                className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white uppercase"
              >
                CANCEL
              </button>

              <button
                type="button"
                disabled={resendTimer > 0 || loading}
                onClick={handleResend}
                className={`${
                  resendTimer > 0 || loading
                    ? "text-slate-400 cursor-not-allowed"
                    : "text-pixelBlue-500 hover:underline"
                } uppercase`}
              >
                {resendTimer > 0 ? `RESEND IN ${resendTimer}S` : "RESEND CODE"}
              </button>
            </div>
          </div>
        )}

        {mode === "password-reset-otp" && (
          <div className="flex flex-col gap-4">
            <p className="text-xs font-bold text-center text-slate-600 dark:text-slate-400">
              ENTER 6-DIGIT RESET CODE SENT TO
              <br />
              <span className="font-mono text-pixelBlue-500 font-black break-all">
                {routeEmail || "user@learnify.io"}
              </span>
            </p>

            <div className="flex justify-between gap-1.5">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (otpRefs.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  autoComplete={idx === 0 ? "one-time-code" : "off"}
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  className="w-full max-w-11 aspect-[11/12] bg-slate-100 dark:bg-navy-800 border-2 border-slate-900 dark:border-slate-700 text-center font-arcade text-sm sm:text-base text-slate-900 dark:text-white outline-none focus:border-pixelPurple-500 focus:bg-white dark:focus:bg-navy-800 min-w-0"
                />
              ))}
            </div>

            <button
              type="button"
              onClick={handlePasswordResetOtp}
              disabled={loading || otp.join("").length !== 6}
              className="w-full py-3 bg-pixelPurple-500 hover:opacity-90 text-white font-black text-xs border-2 border-slate-900 shadow-pixel-md active:translate-x-0.5 active:translate-y-0.5 uppercase transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "VERIFYING..." : "VERIFY RESET CODE"}
            </button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => goTo("/forgot-password")}
                className="text-xs font-bold text-pixelBlue-500 hover:underline uppercase flex items-center justify-center gap-1 mx-auto"
              >
                <Icon name="arrowLeft" size={14} />

                <span>USE DIFFERENT EMAIL</span>
              </button>
            </div>
          </div>
        )}

        {mode === "new-password" && (
          <form
            onSubmit={handleResetPassword}
            className="flex flex-col gap-3.5"
          >
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400 text-center">
              CREATE A NEW PASSWORD FOR YOUR LEARNIFY ACCOUNT.
            </p>

            <div>
              <label className="block text-[10px] font-arcade uppercase text-slate-600 dark:text-slate-400 mb-1">
                NEW PASSWORD
              </label>

              <input
                type="password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setError("");
                }}
                placeholder="••••••••"
                autoComplete="new-password"
                className="w-full p-2.5 bg-slate-100 dark:bg-navy-800 border-2 border-slate-900 dark:border-slate-700 text-xs font-bold outline-none text-slate-900 dark:text-white focus:bg-white dark:focus:bg-navy-800 focus:border-pixelBlue-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-arcade uppercase text-slate-600 dark:text-slate-400 mb-1">
                CONFIRM PASSWORD
              </label>

              <input
                type="password"
                value={confirmNewPassword}
                onChange={(e) => {
                  setConfirmNewPassword(e.target.value);
                  setError("");
                }}
                placeholder="••••••••"
                autoComplete="new-password"
                className="w-full p-2.5 bg-slate-100 dark:bg-navy-800 border-2 border-slate-900 dark:border-slate-700 text-xs font-bold outline-none text-slate-900 dark:text-white focus:bg-white dark:focus:bg-navy-800 focus:border-pixelBlue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-pixelGreen-400 hover:bg-pixelGreen-500 text-slate-900 font-black text-xs border-2 border-slate-900 shadow-pixel-md active:translate-x-0.5 active:translate-y-0.5 uppercase transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "UPDATING..." : "UPDATE PASSWORD"}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => goTo("/login")}
                className="text-xs font-bold text-pixelBlue-500 hover:underline uppercase flex items-center justify-center gap-1 mx-auto"
              >
                <Icon name="arrowLeft" size={14} />

                <span>BACK TO LOG IN</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthenticationCanvas;
