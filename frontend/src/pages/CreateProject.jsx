import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import FreelancerNavbar from "../components/FreelancerNavbar";
import api from "../services/api";
import "./MyProjects.css";
import "./CreateProject.css";

function ClientCreateNavbar() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <header className="my-projects-navbar">
            <div
                className="my-projects-logo"
                onClick={() => navigate("/client/dashboard")}
                style={{ cursor: "pointer" }}
            >
                FreelanceHub
            </div>

            <nav className="my-projects-nav">
                <button onClick={() => navigate("/client/dashboard")}>
                    Dashboard
                </button>

                <button
                    className="active"
                    onClick={() => navigate("/projects/create")}
                >
                    Post Project
                </button>

                <button onClick={() => navigate("/projects")}>
                    My Projects
                </button>

                <button onClick={() => navigate("/find-freelancers")}>
                    Find Freelancers
                </button>
            </nav>

            <div className="my-projects-user">
                <span>{user?.username}</span>
                <button onClick={handleLogout}>Logout</button>
            </div>
        </header>
    );
}

function CreateProject() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        budget_type: "HOURLY",
        budget_amount: "",
        priority: "MEDIUM",
        deadline: "",
        required_skill_names: [],
        skill_input: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const addSkill = () => {
        const skillName = formData.skill_input.trim();

        if (!skillName) {
            return;
        }

        const alreadyAdded = formData.required_skill_names.some(
            (skill) => skill.toLowerCase() === skillName.toLowerCase()
        );

        if (alreadyAdded) {
            setFormData((previous) => ({
                ...previous,
                skill_input: "",
            }));
            return;
        }

        setFormData((previous) => ({
            ...previous,
            required_skill_names: [
                ...previous.required_skill_names,
                skillName,
            ],
            skill_input: "",
        }));
    };

    const handleSkillInputKeyDown = (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            addSkill();
        }
    };

    const removeSkill = (skillToRemove) => {
        setFormData((previous) => ({
            ...previous,
            required_skill_names: previous.required_skill_names.filter(
                (skill) => skill !== skillToRemove
            ),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSubmitting(true);

        try {
            const payload = {
                title: formData.title,
                description: formData.description,
                budget_type: formData.budget_type,
                budget_amount: formData.budget_amount,
                priority: formData.priority,
                deadline: formData.deadline,
                required_skill_names: formData.required_skill_names,
            };

            const response = await api.post(
                "/projects/",
                payload
            );

            console.log("Project created:", response.data);

            navigate("/projects");

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
                    setError("Unable to create project.");
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

    return (
        <div className="projects-page">

            {user?.role === "FREELANCER" ? (
                <FreelancerNavbar />
            ) : (
                <ClientCreateNavbar />
            )}

            {/* Main */}

            <main className="create-project-content">

                <div className="create-project-header">

                    <button
                        className="back-button"
                        onClick={() =>
                            navigate("/projects")
                        }
                    >
                        ← Back to My Projects
                    </button>

                    <p className="page-label">
                        {user?.role === "FREELANCER"
                            ? "FREELANCER WORKSPACE"
                            : "CLIENT WORKSPACE"}
                    </p>

                    <h1>
                        Post a Project
                    </h1>

                    <p>
                        Need help with a project? Post it and find a freelancer
                        to collaborate with.
                    </p>

                </div>

                <form
                    className="project-form"
                    onSubmit={handleSubmit}
                >

                    {/* Basic Information */}

                    <section className="form-section">

                        <div className="form-section-header">

                            <h2>
                                Project Information
                            </h2>

                            <p>
                                Describe what you want to build.
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
                                placeholder="e.g. Build an E-commerce Website"
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
                                placeholder="Describe your project, requirements, expected outcome, and any important details..."
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
                                Define your budget and expected
                                completion date.
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
                                    placeholder="e.g. 50000"
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

                    {/* Required Skills */}

                    <section className="form-section">

                        <div className="form-section-header">

                            <h2>
                                Required Skills
                            </h2>

                            <p>
                                Enter the skills you want your collaborating
                                freelancer to have.
                            </p>

                        </div>

                        <div className="manual-skill-input-row">

                            <input
                                type="text"
                                value={formData.skill_input}
                                onChange={(event) =>
                                    setFormData((previous) => ({
                                        ...previous,
                                        skill_input: event.target.value,
                                    }))
                                }
                                onKeyDown={handleSkillInputKeyDown}
                                placeholder="e.g. Python, Django, Power BI, SQL..."
                                className="manual-skill-input"
                            />

                            <button
                                type="button"
                                className="add-skill-button"
                                onClick={addSkill}
                                disabled={!formData.skill_input.trim()}
                            >
                                + Add Skill
                            </button>

                        </div>

                        <p className="skill-input-hint">
                            Type a skill and press Enter or click &quot;Add Skill&quot;.
                        </p>

                        {formData.required_skill_names.length > 0 && (
                            <div className="selected-skills-list">
                                {formData.required_skill_names.map((skill) => (
                                    <span
                                        className="selected-skill-tag"
                                        key={skill}
                                    >
                                        {skill}
                                        <button
                                            type="button"
                                            onClick={() => removeSkill(skill)}
                                            aria-label={`Remove ${skill}`}
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}

                    </section>

                    {/* Error */}

                    {error && (
                        <div className="projects-error">
                            {error}
                        </div>
                    )}

                    {/* Submit */}

                    <div className="project-form-footer">

                        <button
                            type="button"
                            className="secondary-button cancel-button"
                            onClick={() =>
                                navigate("/projects")
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
                                ? "Posting Project..."
                                : "Post Project"}
                        </button>

                    </div>

                </form>

            </main>

        </div>
    );
}

export default CreateProject;