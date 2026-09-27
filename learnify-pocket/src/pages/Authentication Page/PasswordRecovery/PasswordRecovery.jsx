import { useState } from "react";
import { forgotPassword } from "../../../services/AuthService";
import "./ForgotPassword.css";

function ForgotPassword({ onBack, onOtpSent }) {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");

        if (!email.trim()) {
            setError("Please enter your email address.");
            return;
        }

        try {
            setLoading(true);

            await forgotPassword(email.trim());

            onOtpSent(email.trim());
        } catch (error) {
            setError(
                error.message ||
                "Something went wrong."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="password-recovery-page">

            <button
                type="button"
                className="password-recovery-back"
                onClick={onBack}
            >
                ← Back to Login
            </button>

            <div className="password-recovery-content">

                <h1>Forgot Password?</h1>

                <p>
                    Enter your email address and we'll
                    send you a verification code.
                </p>

                <form onSubmit={handleSubmit}>

                    <label>
                        Email Address
                    </label>

                    <input
                        type="email"
                        value={email}
                        onChange={(event) =>
                            setEmail(event.target.value)
                        }
                        placeholder="Enter your email"
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
                            ? "Sending..."
                            : "Send Code"}
                    </button>

                </form>

            </div>

        </div>
    );
}

export default ForgotPassword;