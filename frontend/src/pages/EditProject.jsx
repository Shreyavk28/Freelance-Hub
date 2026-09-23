import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./MyProjects.css";
import "./CreateProject.css";

function EditProject() {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        budget_type: "HOURLY",
        budget_amount: "",
        priority: "MEDIUM",
        deadline: "",
        required_skills: [],
    });

    useEffect(() => {
        loadProject();
        loadSkills();
    }, [projectId]);

    const loadProject = async () => {
        try {
            const response = await api.get(
                `/projects/${projectId}/`
            );

            const project = response.data;

            setFormData({
                title: project.title || "",
                description: project.description || "",
                budget_type: project.budget_type || "HOURLY",
                budget_amount: project.budget_amount || "",
                priority: project.priority || "MEDIUM",
                deadline: project.deadline || "",
                required_skills: project.required_skills || [],
            });

        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.detail ||
                "Unable to load project."
            );
        }
    };

    const loadSkills = async () => {
        try {
            const response = await api.get("/skills/");
            setSkills(response.data);
        } catch (error) {
            console.error(error);

            setError("Unable to load skills.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSkillChange = (skillId) => {
        setFormData((previous) => {
            const selectedSkills =
                previous.required_skills;

            if (selectedSkills.includes(skillId)) {
                return {
                    ...previous,
                    required_skills:
                        selectedSkills.filter(
                            (id) => id !== skillId
                        ),
                };
            }

            return {
                ...previous,
                required_skills: [
                    ...selectedSkills,
                    skillId,
                ],
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setSubmitting(true);
        setError("");

        try {
            await api.put(
                `/projects/${projectId}/`,
                formData
            );

            navigate(`/projects/${projectId}`);

        } catch (error) {
            console.error(error);

            if (error.response?.data) {
                const data = error.response.data;

                if (typeof data === "object") {
                    const messages = Object.entries(data)
                        .map(([field, message]) => {
                            const text = Array.isArray(message)
                                ? message.join(" ")
                                : message;

                            return `${field}: ${text}`;
                        })
                        .join(" | ");

                    setError(messages);
                } else {
                    setError("Unable to update project.");
                }
            } else {
                setError(
                    "Unable to connect to the server."
                );
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this project?"
        );

        if (!confirmed) {
            return;
        }

        try {
            await api.delete(
                `/projects/${projectId}/`
            );

            navigate("/projects");

        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.detail ||
                "Unable to delete project."
            );
        }
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    if (loading) {
        return (
            <div className="projects-page">

                <main className="project-detail-content">

                    <div className="project-detail-loading">
                        Loading project...
                    </div>

                </main>

            </div>
        );
    }

    return (
        <div className="projects-page">

            {/* Navbar */}

            <header className="dashboard-navbar">

                <div className="dashboard-logo">
                    FreelanceHub
                </div>

                <nav className="dashboard-nav">

                    <button
                        onClick={() =>
                            navigate("/client/dashboard")
                        }
                    >
                        Dashboard
                    </button>

                    <button
                        className="nav-active"
                        onClick={() =>
                            navigate("/projects")
                        }
                    >
                        My Projects
                    </button>

                    <button>
                        Find Freelancers
                    </button>

                </nav>

                <div className="dashboard-user">

                    <span>
                        {user?.username}
                    </span>

                    <button
                        className="logout-button"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>

                </div>

            </header>

            {/* Main */}

            <main className="create-project-content">

                <div className="create-project-header">

                    <button
                        className="back-button"
                        onClick={() =>
                            navigate(
                                `/projects/${projectId}`
                            )
                        }
                    >
                        ← Back to Project
                    </button>

                    <p className="page-label">
                        CLIENT WORKSPACE
                    </p>

                    <h1>
                        Edit Project
                    </h1>

                    <p>
                        Update your project requirements,
                        budget, deadline, or skills.
                    </p>

                </div>

                <form
                    className="project-form"
                    onSubmit={handleSubmit}
                >

                    {/* Project Information */}

                    <section className="form-section">

                        <div className="form-section-header">

                            <h2>
                                Project Information
                            </h2>

                            <p>
                                Update the basic project details.
                            </p>

                        </div>

                        <div className="form-group">

                            <label>
                                Project Title
                            </label>

                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                            />

                        </div>

                        <div className="form-group">

                            <label>
                                Project Description
                            </label>

                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="7"
                                required
                            />

                        </div>

                    </section>

                    {/* Budget */}

                    <section className="form-section">

                        <div className="form-section-header">

                            <h2>
                                Budget & Timeline
                            </h2>

                            <p>
                                Update your budget and deadline.
                            </p>

                        </div>

                        <div className="form-grid">

                            <div className="form-group">

                                <label>
                                    Budget Type
                                </label>

                                <select
                                    name="budget_type"
                                    value={formData.budget_type}
                                    onChange={handleChange}
                                >

                                    <option value="HOURLY">
                                        Hourly
                                    </option>

                                    <option value="MONTHLY">
                                        Monthly
                                    </option>

                                </select>

                            </div>

                            <div className="form-group">

                                <label>
                                    Budget Amount
                                </label>

                                <input
                                    type="number"
                                    name="budget_amount"
                                    value={formData.budget_amount}
                                    onChange={handleChange}
                                    min="1"
                                    step="0.01"
                                    required
                                />

                            </div>

                            <div className="form-group">

                                <label>
                                    Deadline
                                </label>

                                <input
                                    type="date"
                                    name="deadline"
                                    value={formData.deadline}
                                    onChange={handleChange}
                                    required
                                />

                            </div>

                            <div className="form-group">

                                <label>
                                    Priority
                                </label>

                                <select
                                    name="priority"
                                    value={formData.priority}
                                    onChange={handleChange}
                                >

                                    <option value="LOW">
                                        Low
                                    </option>

                                    <option value="MEDIUM">
                                        Medium
                                    </option>

                                    <option value="HIGH">
                                        High
                                    </option>

                                    <option value="URGENT">
                                        Urgent
                                    </option>

                                </select>

                            </div>

                        </div>

                    </section>

                    {/* Skills */}

                    <section className="form-section">

                        <div className="form-section-header">

                            <h2>
                                Required Skills
                            </h2>

                            <p>
                                Update the skills required for
                                this project.
                            </p>

                        </div>

                        <div className="skills-selector">

                            {skills.map((skill) => {

                                const selected =
                                    formData.required_skills.includes(
                                        skill.id
                                    );

                                return (
                                    <button
                                        type="button"
                                        key={skill.id}
                                        className={
                                            selected
                                                ? "skill-option selected"
                                                : "skill-option"
                                        }
                                        onClick={() =>
                                            handleSkillChange(
                                                skill.id
                                            )
                                        }
                                    >
                                        {selected && (
                                            <span>
                                                ✓
                                            </span>
                                        )}

                                        {skill.name}
                                    </button>
                                );
                            })}

                        </div>

                    </section>

                    {error && (
                        <div className="projects-error">
                            {error}
                        </div>
                    )}

                    {/* Footer */}

                    <div className="project-form-footer">

                        <button
                            type="button"
                            className="delete-button"
                            onClick={handleDelete}
                        >
                            Delete Project
                        </button>

                        <div className="edit-actions">

                            <button
                                type="button"
                                className="secondary-button"
                                onClick={() =>
                                    navigate(
                                        `/projects/${projectId}`
                                    )
                                }
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="primary-button"
                                disabled={submitting}
                            >
                                {submitting
                                    ? "Saving Changes..."
                                    : "Save Changes"}
                            </button>

                        </div>

                    </div>

                </form>

            </main>

        </div>
    );
}

export default EditProject;