import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Auth.css";

function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        first_name: "",
        last_name: "",
        role: "FREELANCER",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            await api.post("/auth/register/", formData);

            alert("Registration successful!");

            navigate("/login");
        } catch (error) {
            console.error(error);

            if (error.response?.data) {
                const data = error.response.data;

                if (typeof data === "object") {
                    const messages = Object.values(data)
                        .flat()
                        .join(" ");

                    setError(messages);
                } else {
                    setError("Registration failed.");
                }
            } else {
                setError("Unable to connect to the server.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">

            {/* Left Side */}

            <div className="auth-brand">

                <div className="auth-logo">
                    FreelanceHub
                </div>

                <h1>Build. Collaborate. Grow.</h1>

                <h2>
                    Find the right opportunity or talent.
                </h2>

                <p>
                    Connect clients with skilled freelancers,
                    manage projects, collaborate, and grow
                    together on one platform.
                </p>

                <div className="brand-features">

                    <div className="brand-feature">
                        <span className="brand-check">✓</span>
                        Find projects and skilled professionals
                    </div>

                    <div className="brand-feature">
                        <span className="brand-check">✓</span>
                        Collaborate and manage projects
                    </div>

                    <div className="brand-feature">
                        <span className="brand-check">✓</span>
                        Communicate in real time
                    </div>

                    <div className="brand-feature">
                        <span className="brand-check">✓</span>
                        Build your professional portfolio
                    </div>

                </div>

            </div>

            {/* Right Side */}

            <div className="auth-form-section">

                <div className="auth-card">

                    <div className="auth-card-header">

                        <h2>Create your account</h2>

                        <p>
                            Join FreelanceHub and get started.
                        </p>

                    </div>

                    <form
                        className="auth-form"
                        onSubmit={handleSubmit}
                    >

                        <div className="form-group">

                            <label>
                                Username
                            </label>

                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="Enter username"
                                required
                            />

                        </div>

                        <div className="form-group">

                            <label>
                                Email
                            </label>

                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter email"
                                required
                            />

                        </div>

                        <div className="form-row">

                            <div className="form-group">

                                <label>
                                    First Name
                                </label>

                                <input
                                    type="text"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    placeholder="First name"
                                />

                            </div>

                            <div className="form-group">

                                <label>
                                    Last Name
                                </label>

                                <input
                                    type="text"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    placeholder="Last name"
                                />

                            </div>

                        </div>

                        <div className="form-group">

                            <label>
                                Password
                            </label>

                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Minimum 8 characters"
                                required
                            />

                        </div>

                        <div className="form-group">

                            <label>
                                I want to join as
                            </label>

                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                            >

                                <option value="FREELANCER">
                                    Freelancer
                                </option>

                                <option value="CLIENT">
                                    Client
                                </option>

                            </select>

                        </div>

                        {error && (
                            <div className="auth-error">
                                {error}
                            </div>
                        )}

                        <button
                            className="auth-button"
                            type="submit"
                            disabled={loading}
                        >
                            {loading
                                ? "Creating account..."
                                : "Create Account"}
                        </button>

                    </form>

                    <div className="auth-footer">

                        Already have an account?{" "}

                        <button
                            className="auth-link-button"
                            onClick={() => navigate("/login")}
                        >
                            Login
                        </button>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default Register;