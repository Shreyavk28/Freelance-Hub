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
        required_skill_names: [],
        skill_input: "",
    });

    // =========================================================
    // LOAD PROJECT
    // =========================================================

    useEffect(() => {
        loadProject();
    }, [projectId]);

    const loadProject = async () => {
        try {
            setLoading(true);
            setError("");

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

                required_skills: Array.isArray(
                    project.required_skills
                )
                    ? project.required_skills.map(Number)
                    : [],

                required_skill_names: Array.isArray(
                    project.required_skill_names
                )
                    ? project.required_skill_names
                    : [],

                skill_input: "",
            });

        } catch (error) {
            console.error(
                "Error loading project:",
                error
            );

            setError(
                error.response?.data?.detail ||
                "Unable to load project."
            );
        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // GENERAL FORM CHANGE
    // =========================================================

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    // =========================================================
    // ADD MANUAL SKILL
    // =========================================================

    const addSkill = () => {
        const skillName = formData.skill_input.trim();

        if (!skillName) {
            return;
        }

        const alreadyExists =
            formData.required_skill_names.some(
                (skill) =>
                    skill.toLowerCase() ===
                    skillName.toLowerCase()
            );

        if (alreadyExists) {
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

    // =========================================================
    // ENTER KEY FOR ADDING SKILL
    // =========================================================

    const handleSkillInputKeyDown = (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            addSkill();
        }
    };

    // =========================================================
    // REMOVE SKILL
    // =========================================================

    const removeSkill = (skillName) => {
        setFormData((previous) => ({
            ...previous,

            required_skill_names:
                previous.required_skill_names.filter(
                    (skill) => skill !== skillName
                ),
        }));
    };

    // =========================================================
    // SAVE PROJECT
    // =========================================================

    const handleSubmit = async (event) => {
        event.preventDefault();

        setSubmitting(true);
        setError("");

        try {
            const payload = {
                title: formData.title,
                description: formData.description,
                budget_type: formData.budget_type,
                budget_amount: formData.budget_amount,
                priority: formData.priority,
                deadline: formData.deadline,

                required_skills:
                    formData.required_skills,

                required_skill_names:
                    formData.required_skill_names,
            };

            console.log(
                "Updating project:",
                payload
            );

            await api.put(
                `/projects/${projectId}/`,
                payload
            );

            navigate(
                `/projects/${projectId}`
            );

        } catch (error) {
            console.error(
                "Error updating project:",
                error
            );

            if (error.response?.data) {
                const data =
                    error.response.data;

                if (
                    typeof data === "object"
                ) {
                    const messages =
                        Object.entries(data)
                            .map(
                                ([field, message]) => {
                                    const text =
                                        Array.isArray(
                                            message
                                        )
                                            ? message.join(
                                                " "
                                            )
                                            : String(
                                                message
                                            );

                                    return `${field}: ${text}`;
                                }
                            )
                            .join(" | ");

                    setError(messages);
                } else {
                    setError(
                        "Unable to update project."
                    );
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

    // =========================================================
    // DELETE PROJECT
    // =========================================================

    const handleDelete = async () => {
        const confirmed =
            window.confirm(
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

    // =========================================================
    // LOGOUT
    // =========================================================

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    // =========================================================
    // LOADING
    // =========================================================

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

    // =========================================================
    // UI
    // =========================================================

    return (
        <div className="projects-page">

            {/* =================================================
                NAVBAR
            ================================================= */}

            <header className="dashboard-navbar">

                <div className="dashboard-logo">
                    FreelanceHub
                </div>

                <nav className="dashboard-nav">

                    <button
                        onClick={() =>
                            navigate(
                                "/client/dashboard"
                            )
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

            {/* =================================================
                MAIN
            ================================================= */}

            <main className="create-project-content">

                {/* PAGE HEADER */}

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
                        Update your project
                        requirements, budget,
                        deadline, or skills.
                    </p>

                </div>

                {/* =================================================
                    FORM
                ================================================= */}

                <form
                    className="project-form"
                    onSubmit={handleSubmit}
                >

                    {/* =================================================
                        PROJECT INFORMATION
                    ================================================= */}

                    <section className="form-section">

                        <div className="form-section-header">

                            <h2>
                                Project Information
                            </h2>

                            <p>
                                Update the basic
                                project details.
                            </p>

                        </div>

                        <div className="form-group">

                            <label>
                                Project Title
                            </label>

                            <input
                                type="text"
                                name="title"
                                value={
                                    formData.title
                                }
                                onChange={
                                    handleChange
                                }
                                required
                            />

                        </div>

                        <div className="form-group">

                            <label>
                                Project Description
                            </label>

                            <textarea
                                name="description"
                                value={
                                    formData.description
                                }
                                onChange={
                                    handleChange
                                }
                                rows="7"
                                required
                            />

                        </div>

                    </section>

                    {/* =================================================
                        BUDGET
                    ================================================= */}

                    <section className="form-section">

                        <div className="form-section-header">

                            <h2>
                                Budget & Timeline
                            </h2>

                            <p>
                                Update your budget
                                and deadline.
                            </p>

                        </div>

                        <div className="form-grid">

                            {/* Budget Type */}

                            <div className="form-group">

                                <label>
                                    Budget Type
                                </label>

                                <select
                                    name="budget_type"
                                    value={
                                        formData.budget_type
                                    }
                                    onChange={
                                        handleChange
                                    }
                                >

                                    <option value="HOURLY">
                                        Hourly
                                    </option>

                                    <option value="MONTHLY">
                                        Monthly
                                    </option>

                                </select>

                            </div>

                            {/* Budget Amount */}

                            <div className="form-group">

                                <label>
                                    Budget Amount
                                </label>

                                <input
                                    type="number"
                                    name="budget_amount"
                                    value={
                                        formData.budget_amount
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    min="1"
                                    step="0.01"
                                    required
                                />

                            </div>

                            {/* Deadline */}

                            <div className="form-group">

                                <label>
                                    Deadline
                                </label>

                                <input
                                    type="date"
                                    name="deadline"
                                    value={
                                        formData.deadline
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                />

                            </div>

                            {/* Priority */}

                            <div className="form-group">

                                <label>
                                    Priority
                                </label>

                                <select
                                    name="priority"
                                    value={
                                        formData.priority
                                    }
                                    onChange={
                                        handleChange
                                    }
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

                    {/* =================================================
                        REQUIRED SKILLS
                    ================================================= */}

                    <section className="form-section">

                        <div className="form-section-header">

                            <h2>
                                Required Skills
                            </h2>

                            <p>
                                Add or remove the
                                skills required for
                                this project.
                            </p>

                        </div>

                        {/* =================================================
                            MANUAL SKILL INPUT
                        ================================================= */}

                        <div className="manual-skill-input-row">

                            <input
                                type="text"
                                value={
                                    formData.skill_input
                                }
                                onChange={(event) =>
                                    setFormData(
                                        (previous) => ({
                                            ...previous,
                                            skill_input:
                                                event.target.value,
                                        })
                                    )
                                }
                                onKeyDown={
                                    handleSkillInputKeyDown
                                }
                                placeholder="Type a skill e.g. Python, Django, React, AWS..."
                                className="manual-skill-input"
                            />

                            <button
                                type="button"
                                className="add-skill-button"
                                onClick={addSkill}
                                disabled={
                                    !formData.skill_input.trim()
                                }
                            >
                                + Add Skill
                            </button>

                        </div>

                        <p className="skill-input-hint">
                            Type a skill manually and
                            press Enter or click
                            &quot;+ Add Skill&quot;.
                        </p>

                        {/* =================================================
                            SELECTED SKILLS
                        ================================================= */}

                        <div className="selected-skills-list">

                            {formData
                                .required_skill_names
                                .map((skill) => (

                                    <span
                                        className="selected-skill-tag"
                                        key={skill}
                                    >

                                        {skill}

                                        <button
                                            type="button"
                                            onClick={() =>
                                                removeSkill(
                                                    skill
                                                )
                                            }
                                            aria-label={`Remove ${skill}`}
                                        >
                                            ×
                                        </button>

                                    </span>

                                ))}

                        </div>

                        {formData
                            .required_skill_names
                            .length === 0 && (

                            <p
                                style={{
                                    color: "#64748b",
                                    marginTop: "10px",
                                }}
                            >
                                No skills added
                                yet. Type a skill
                                above to add one.
                            </p>

                        )}

                    </section>

                    {/* =================================================
                        ERROR
                    ================================================= */}

                    {error && (
                        <div className="projects-error">
                            {error}
                        </div>
                    )}

                    {/* =================================================
                        FOOTER
                    ================================================= */}

                    <div className="project-form-footer">

                        <button
                            type="button"
                            className="delete-button"
                            onClick={
                                handleDelete
                            }
                        >
                            Delete Project
                        </button>

                        <div className="edit-actions">

                            {/* EDIT PROJECT ONLY CANCEL BUTTON */}

                            <button
                                type="button"
                                className="edit-project-cancel-button"
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
                                disabled={
                                    submitting
                                }
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