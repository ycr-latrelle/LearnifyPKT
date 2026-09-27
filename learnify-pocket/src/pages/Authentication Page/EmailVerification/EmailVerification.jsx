import { useState } from "react";

import {
    verifyEmail,
    resendVerification
} from "../../../services/AuthService";

import "./EmailVerification.css";

function EmailVerification({
    uid,
    email,
    name,
    onVerified
}) {
    const [otp, setOtp] = useState("");

    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const handleOtpChange = (event) => {
        const value = event.target.value
            .replace(/\D/g, "")
            .slice(0, 6);

        setOtp(value);
        setError("");
    };

    const handleVerify = async (event) => {
        event.preventDefault();

        if (otp.length !== 6) {
            setError(
                "Please enter the 6-digit verification code."
            );
            return;
        }

        try {
            setLoading(true);
            setError("");
            setMessage("");

            const result = await verifyEmail(uid, otp.trim());

            if (!result.success) {
                setError(
                    result.message ||
                    "Verification failed."
                );
                return;
            }

            onVerified(result);
        } catch (error) {
            setError(
                error.message ||
                "Unable to connect to the server."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        try {
            setResending(true);
            setError("");
            setMessage("");

            const result = await resendVerification(uid);

            if (!result.success) {
                setError(
                    result.message ||
                    "Unable to resend verification code."
                );
                return;
            }

            setMessage(
                "A new verification code has been sent to your email."
            );

            setOtp("");
        } catch (error) {
            setError(
                error.message ||
                "Unable to connect to the server."
            );
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="email-verification">
            <div className="verification-content">
                <h1>Verify your email</h1>

                <p>Hi {name},</p>

                <p>
                    We sent a 6-digit verification code to:
                </p>

                <strong>{email}</strong>

                <form onSubmit={handleVerify}>
                    <label htmlFor="otp">
                        Verification Code
                    </label>

                    <input
                        id="otp"
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        value={otp}
                        onChange={handleOtpChange}
                        placeholder="000000"
                        maxLength={6}
                    />

                    {error && (
                        <p className="verification-error">
                            {error}
                        </p>
                    )}

                    {message && (
                        <p className="verification-message">
                            {message}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={
                            loading ||
                            otp.length !== 6
                        }
                    >
                        {loading
                            ? "Verifying..."
                            : "Verify Email"}
                    </button>
                </form>

                <div className="resend-container">
                    <p>
                        Didn't receive the code?
                    </p>

                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={resending}
                    >
                        {resending
                            ? "Sending..."
                            : "Resend Code"}
                    </button>
                </div>

                <button
                    type="button"
                    onClick={() => onVerified(null)}
                >
                    Back to Login
                </button>
            </div>
        </div>
    );
}

export default EmailVerification;