import React, { useState } from "react";
import { Icon } from "../AuthenticationCanvas";

/**
 * LoginPage
 * Pure login form. Talks to AuthenticationCanvas via props only —
 * it does not know about "register" or "otp" modes.
 *
 * Props:
 *  - onLogin(email, password)         -> Promise, throw on failure
 *  - onGoogleLogin()                  -> called when "Continue with Google" is clicked
 *  - onSwitchToRegister()             -> navigate to Registration
 *  - onForgotPassword()               -> navigate to Forgot Password flow
 *  - loading (bool)
 *  - error (string)
 */
export const LoginPage = ({
  onLogin,
  onGoogleLogin,
  onSwitchToRegister,
  onForgotPassword,
  loading,
  error,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin?.(email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
      {error && (
        <div className="p-2.5 bg-pixelRed-500 text-white font-bold text-xs border-2 border-slate-900 text-center uppercase shadow-pixel-sm">
          ⚠️ {error}
        </div>
      )}

      <div>
        <label className="block text-[10px] font-arcade uppercase text-slate-600 dark:text-slate-400 mb-1">
          PLAYER EMAIL
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="player@learnify.io"
          className="w-full p-2.5 bg-slate-100 dark:bg-navy-800 border-2 border-slate-900 dark:border-slate-700 text-xs font-bold outline-none text-slate-900 dark:text-white focus:border-pixelBlue-500"
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="text-[10px] font-arcade uppercase text-slate-600 dark:text-slate-400">
            PASSWORD
          </label>
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-[10px] font-bold text-pixelBlue-500 hover:underline uppercase"
          >
            FORGOT?
          </button>
        </div>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full p-2.5 pr-10 bg-slate-100 dark:bg-navy-800 border-2 border-slate-900 dark:border-slate-700 text-xs font-bold outline-none text-slate-900 dark:text-white focus:border-pixelBlue-500"
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            <Icon name={showPassword ? "eyeOff" : "eye"} size={16} />
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-pixelBlue-500 hover:bg-pixelBlue-600 text-white font-black text-xs border-2 border-slate-900 shadow-pixel-md active:translate-x-0.5 active:translate-y-0.5 uppercase transition-all disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {loading ? "LOGGING IN..." : "START GAME / LOG IN"}
      </button>

      <button
        type="button"
        onClick={onGoogleLogin}
        className="w-full py-2.5 bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-800/70 text-slate-900 dark:text-white font-bold text-xs border-2 border-slate-900 shadow-pixel-sm flex items-center justify-center gap-2 uppercase active:translate-x-0.5 active:translate-y-0.5 transition-all"
      >
        <Icon name="google" size={16} />
        <span>CONTINUE WITH GOOGLE</span>
      </button>

      <div className="pt-3 border-t-2 border-slate-200 dark:border-slate-800 text-center">
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">NEW PLAYER?</p>
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="w-full py-2 bg-pixelYellow-400 hover:bg-pixelYellow-500 text-slate-900 font-black text-xs border-2 border-slate-900 shadow-pixel-sm active:translate-x-0.5 active:translate-y-0.5 uppercase transition-all"
        >
          + CREATE NEW ACCOUNT
        </button>
      </div>
    </form>
  );
};

export default LoginPage;
