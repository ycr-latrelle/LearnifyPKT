import { useState } from "react";
import { resetPassword } from "../../../services/AuthService";
import "./NewPassword.css";

function NewPassword({
    email,
    resetToken,
    onCompleted
}) {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] =
        useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");

        if (password.length < 6) {
            setError(
                "Password must be at least 6 characters."
            );
            return;
        }

        if (password !== confirmPassword) {
            setError(
                "Passwords do not match."
            );
            return;
        }

        try {
            setLoading(true);

            await resetPassword(
                email,
                resetToken,
                password
            );

            onCompleted();
        } catch (error) {
            setError(
                error.message ||
                "Unable to reset password."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="new-password-page">

            <h1>Create New Password</h1>

            <p>
                Enter your new password below.
            </p>

            <form onSubmit={handleSubmit}>

                <label>
                    New Password
                </label>

                <input
                    type="password"
                    value={password}
                    onChange={(event) =>
                        setPassword(
                            event.target.value
                        )
                    }
                    disabled={loading}
                />

                <label>
                    Confirm Password
                </label>

                <input
                    type="password"
                    value={confirmPassword}
                    onChange={(event) =>
                        setConfirmPassword(
                            event.target.value
                        )
                    }
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
                        ? "Resetting..."
                        : "Reset Password"}
                </button>

            </form>

        </div>
    );
}

export default NewPassword;