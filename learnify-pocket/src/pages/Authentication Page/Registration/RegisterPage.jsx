import React, { useState } from 'react';

/**
 * RegisterPage
 * Pure registration form. Talks to AuthenticationCanvas via props only —
 * it does not know about "login" or "otp" modes.
 *
 * Props:
 *  - onRegister({ name, email, password, confirmPassword }) -> Promise, throw on failure
 *  - onSwitchToLogin()
 *  - loading (bool)
 *  - error (string)
 */
const calculatePasswordStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score; // 0 to 4
};

export const RegisterPage = ({ onRegister, onSwitchToLogin, loading, error }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const passwordStrength = calculatePasswordStrength(password);
    const strengthLabel =
        passwordStrength === 0 ? 'WEAK' :
            passwordStrength === 1 ? 'FAIR' :
                passwordStrength === 2 ? 'GOOD' : 'STRONG';

    const handleSubmit = (e) => {
        e.preventDefault();
        onRegister?.({ name, email, password, confirmPassword });
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {error && (
                <div className="p-2.5 bg-pixelRed-500 text-white font-bold text-xs border-2 border-slate-900 text-center uppercase shadow-pixel-sm">
                    ⚠️ {error}
                </div>
            )}

            <div>
                <label className="block text-[10px] font-arcade uppercase text-slate-600 dark:text-slate-400 mb-1">
                    PLAYER NAME
                </label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Rivera"
                    className="w-full p-2.5 bg-slate-100 dark:bg-navy-800 border-2 border-slate-900 dark:border-slate-700 text-xs font-bold outline-none text-slate-900 dark:text-white"
                />
            </div>

            <div>
                <label className="block text-[10px] font-arcade uppercase text-slate-600 dark:text-slate-400 mb-1">
                    PLAYER EMAIL
                </label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="player@learnify.io"
                    className="w-full p-2.5 bg-slate-100 dark:bg-navy-800 border-2 border-slate-900 dark:border-slate-700 text-xs font-bold outline-none text-slate-900 dark:text-white"
                />
            </div>

            <div>
                <label className="block text-[10px] font-arcade uppercase text-slate-600 dark:text-slate-400 mb-1">
                    PASSWORD
                </label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full p-2.5 bg-slate-100 dark:bg-navy-800 border-2 border-slate-900 dark:border-slate-700 text-xs font-bold outline-none text-slate-900 dark:text-white"
                />

                {password.length > 0 && (
                    <div className="mt-1.5 space-y-1">
                        <div className="flex justify-between items-center text-[9px] font-bold text-slate-500 dark:text-slate-400">
                            <span>STRENGTH:</span>
                            <span>{strengthLabel}</span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 border border-slate-900 flex gap-0.5 p-0.5">
                            <div className={`h-full flex-1 ${passwordStrength >= 1 ? 'bg-pixelRed-500' : 'bg-transparent'}`} />
                            <div className={`h-full flex-1 ${passwordStrength >= 2 ? 'bg-pixelYellow-400' : 'bg-transparent'}`} />
                            <div className={`h-full flex-1 ${passwordStrength >= 3 ? 'bg-emerald-500' : 'bg-transparent'}`} />
                        </div>
                    </div>
                )}
            </div>

            <div>
                <label className="block text-[10px] font-arcade uppercase text-slate-600 dark:text-slate-400 mb-1">
                    CONFIRM PASSWORD
                </label>
                <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full p-2.5 bg-slate-100 dark:bg-navy-800 border-2 border-slate-900 dark:border-slate-700 text-xs font-bold outline-none text-slate-900 dark:text-white"
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-pixelGreen-400 hover:bg-pixelGreen-500 text-slate-900 font-black text-xs border-2 border-slate-900 shadow-pixel-md active:translate-x-0.5 active:translate-y-0.5 uppercase transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {loading ? 'REGISTERING...' : 'REGISTER PLAYER'}
            </button>

            <div className="pt-2 border-t-2 border-slate-200 dark:border-slate-800 text-center">
                <button
                    type="button"
                    onClick={onSwitchToLogin}
                    className="text-xs font-bold text-pixelBlue-500 hover:underline uppercase"
                >
                    ← ALREADY HAVE AN ACCOUNT? LOG IN
                </button>
            </div>
        </form>
    );
};

export default RegisterPage;