import { useState } from "react";
import { verifyPasswordReset } from "../../../services/AuthService";
import "./PasswordResetOtp.css";

function PasswordResetOtp({
    email,
    onVerified,
    onBack
}) {
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");

        if (otp.length !== 6) {
            setError(
                "Please enter the 6-digit verification code."
            );
            return;
        }

        try {
            setLoading(true);

            const response =
                await verifyPasswordReset(
                    email,
                    otp
                );

            onVerified(response.resetToken);
        } catch (error) {
            setError(
                error.message ||
                "Invalid or expired verification code."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="password-reset-otp-page">

            <button
                type="button"
                onClick={onBack}
            >
                ← Back
            </button>

            <h1>Verify Your Email</h1>

            <p>
                Enter the 6-digit code sent to:
            </p>

            <strong>{email}</strong>

            <form onSubmit={handleSubmit}>

                <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(event) =>
                        setOtp(
                            event.target.value
                                .replace(/\D/g, "")
                        )
                    }
                    placeholder="000000"
                    disabled={loading}
                />

                {error && (
                    <p className="password-recovery-error">
                        {error}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                >
                    {loading
                        ? "Verifying..."
                        : "Verify Code"}
                </button>

            </form>

        </div>
    );
}

export default PasswordResetOtp;