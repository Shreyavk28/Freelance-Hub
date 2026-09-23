import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await api.post(
                "/auth/login/",
                formData
            );

            const { access, refresh } = response.data;

            if (!access || !refresh) {
                throw new Error(
                    "Authentication tokens were not returned."
                );
            }

            /*
             * Decode JWT payload.
             *
             * Your Django LoginSerializer adds:
             * username
             * role
             */
            let payload;

            try {
                payload = JSON.parse(
                    atob(
                        access.split(".")[1]
                            .replace(/-/g, "+")
                            .replace(/_/g, "/")
                    )
                );
            } catch (decodeError) {
                console.error(
                    "Unable to decode access token:",
                    decodeError
                );

                throw new Error(
                    "Invalid authentication token."
                );
            }

            /*
             * Make sure the backend returned a valid role.
             */
            if (
                payload.role !== "CLIENT" &&
                payload.role !== "FREELANCER"
            ) {
                throw new Error(
                    "User role is missing or invalid."
                );
            }

            const userData = {
                username: payload.username,
                role: payload.role,
            };

            /*
             * Save user + access token
             * through AuthContext.
             */
            login(userData, access);

            /*
             * Save refresh token separately.
             */
            localStorage.setItem(
                "refreshToken",
                refresh
            );

            /*
             * Redirect according to role.
             */
            if (userData.role === "CLIENT") {

                navigate("/client/dashboard");

            } else if (
                userData.role === "FREELANCER"
            ) {

                navigate("/freelancer/dashboard");

            }

        } catch (error) {

            console.error(
                "Login error:",
                error
            );

            /*
             * Django validation error
             */
            if (error.response?.data) {

                const responseData =
                    error.response.data;

                if (responseData.detail) {

                    setError(
                        responseData.detail
                    );

                } else if (
                    responseData.non_field_errors
                ) {

                    setError(
                        responseData.non_field_errors.join(
                            " "
                        )
                    );

                } else {

                    setError(
                        "Unable to sign in. Please check your credentials."
                    );
                }

            } else if (error.message) {

                setError(error.message);

            } else {

                setError(
                    "Unable to connect to the server."
                );
            }

        } finally {

            setLoading(false);

        }
    };

    return (
        <div className="auth-page">

            {/* ================================
                Left Side
            ================================= */}

            <div className="auth-brand">

                <div className="auth-logo">
                    FreelanceHub
                </div>

                <h1>
                    Welcome Back.
                </h1>

                <h2>
                    Your next project starts here.
                </h2>

                <p>
                    Sign in to manage your projects,
                    connect with professionals, and
                    continue building your work.
                </p>

                <div className="brand-features">

                    <div className="brand-feature">

                        <span className="brand-check">
                            ✓
                        </span>

                        Manage your projects

                    </div>

                    <div className="brand-feature">

                        <span className="brand-check">
                            ✓
                        </span>

                        Connect with professionals

                    </div>

                    <div className="brand-feature">

                        <span className="brand-check">
                            ✓
                        </span>

                        Track your collaboration

                    </div>

                    <div className="brand-feature">

                        <span className="brand-check">
                            ✓
                        </span>

                        Grow your professional network

                    </div>

                </div>

            </div>

            {/* ================================
                Right Side
            ================================= */}

            <div className="auth-form-section">

                <div className="auth-card">

                    <div className="auth-card-header">

                        <h2>
                            Welcome back
                        </h2>

                        <p>
                            Sign in to your FreelanceHub
                            account.
                        </p>

                    </div>

                    <form
                        className="auth-form"
                        onSubmit={handleSubmit}
                    >

                        {/* Username */}

                        <div className="form-group">

                            <label htmlFor="username">
                                Username
                            </label>

                            <input
                                id="username"
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="Enter username"
                                autoComplete="username"
                                required
                            />

                        </div>

                        {/* Password */}

                        <div className="form-group">

                            <label htmlFor="password">
                                Password
                            </label>

                            <input
                                id="password"
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter password"
                                autoComplete="current-password"
                                required
                            />

                        </div>

                        {/* Error */}

                        {error && (
                            <div
                                className="auth-error"
                                role="alert"
                            >
                                {error}
                            </div>
                        )}

                        {/* Submit */}

                        <button
                            className="auth-button"
                            type="submit"
                            disabled={loading}
                        >
                            {loading
                                ? "Signing in..."
                                : "Sign In"}
                        </button>

                    </form>

                    {/* Footer */}

                    <div className="auth-footer">

                        Don't have an account?{" "}

                        <button
                            type="button"
                            className="auth-link-button"
                            onClick={() =>
                                navigate("/register")
                            }
                        >
                            Create an account
                        </button>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default Login;