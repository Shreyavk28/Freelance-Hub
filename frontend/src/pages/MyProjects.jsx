import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import FreelancerNavbar from "../components/FreelancerNavbar";
import api from "../services/api";
import "./MyProjects.css";

function MyProjects() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const isFreelancer = user?.role === "FREELANCER";
    const isClient = user?.role === "CLIENT";

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/projects/my/");

            setProjects(
                Array.isArray(response.data)
                    ? response.data
                    : response.data.results || []
            );
        } catch (error) {
            console.error("My projects error:", error);

            setError(
                error.response?.data?.detail ||
                    "Unable to load your projects."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const handleViewProject = (projectId) => {
        navigate(`/projects/${projectId}`);
    };

    const handleCreateProject = () => {
        navigate("/projects/create");
    };

    const getStatusClass = (status) => {
        return `my-project-status my-project-status-${status.toLowerCase()}`;
    };

    const formatStatus = (status) => {
        return status.replace("_", " ");
    };

    /*
     * Client navbar
     *
     * Clients should see only their client navigation.
     * They must NOT see the freelancer navbar here.
     */
    const renderClientNavbar = () => (
        <header className="my-projects-navbar">
            <div
                className="my-projects-logo"
                onClick={() => navigate("/client/dashboard")}
            >
                FreelanceHub
            </div>

            <nav className="my-projects-nav">
                <button
                    className={
                        window.location.pathname ===
                        "/client/dashboard"
                            ? "active"
                            : ""
                    }
                    onClick={() =>
                        navigate("/client/dashboard")
                    }
                >
                    Dashboard
                </button>

                <button
                    className={
                        window.location.pathname.startsWith(
                            "/projects"
                        )
                            ? "active"
                            : ""
                    }
                    onClick={() => navigate("/projects")}
                >
                    My Projects
                </button>

                <button
                    className={
                        window.location.pathname.startsWith(
                            "/find-freelancers"
                        )
                            ? "active"
                            : ""
                    }
                    onClick={() =>
                        navigate("/find-freelancers")
                    }
                >
                    Find Freelancers
                </button>
            </nav>

            <div className="my-projects-user">
                <span>{user?.username}</span>

                <button onClick={handleLogout}>
                    Logout
                </button>
            </div>
        </header>
    );

    /*
     * Loading state
     */
    if (loading) {
        return (
            <div className="my-projects-page">
                {isFreelancer ? (
                    <FreelancerNavbar />
                ) : (
                    renderClientNavbar()
                )}

                <main className="my-projects-container">
                    <div className="my-projects-loading">
                        Loading projects...
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="my-projects-page">

            {/* =================================================
                ROLE-BASED NAVBAR
            ================================================= */}

            {isFreelancer ? (
                <FreelancerNavbar />
            ) : (
                renderClientNavbar()
            )}

            {/* =================================================
                MAIN
            ================================================= */}

            <main className="my-projects-container">

                <div className="my-projects-header">

                    <div>
                        <div className="my-projects-label">
                            {isFreelancer
                                ? "FREELANCER WORKSPACE"
                                : "CLIENT WORKSPACE"}
                        </div>

                        <h1>My Projects</h1>

                        <p>
                            {isFreelancer
                                ? "Manage projects you have posted and review proposals from other freelancers."
                                : "Manage your projects and review freelancer proposals."}
                        </p>
                    </div>

                    <button
                        className="create-project-button"
                        onClick={handleCreateProject}
                    >
                        + Create Project
                    </button>

                </div>

                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (
                    <div className="my-projects-error">
                        {error}
                    </div>
                )}

                {/* =================================================
                    EMPTY STATE
                ================================================= */}

                {!error && projects.length === 0 && (
                    <div className="my-projects-empty">

                        <div className="empty-icon">
                            +
                        </div>

                        <h2>
                            No projects yet
                        </h2>

                        <p>
                            {isFreelancer
                                ? "Post a project when you need another freelancer to collaborate with you."
                                : "Create your first project and start receiving proposals from freelancers."}
                        </p>

                        <button
                            onClick={handleCreateProject}
                        >
                            Create Your First Project
                        </button>

                    </div>
                )}

                {/* =================================================
                    PROJECT LIST
                ================================================= */}

                {projects.length > 0 && (

                    <div className="my-projects-list">

                        {projects.map((project) => (

                            <div
                                className="my-project-card"
                                key={project.id}
                            >

                                <div className="my-project-card-top">

                                    <div>

                                        <div className="my-project-title-row">

                                            <h2>
                                                {project.title}
                                            </h2>

                                            <span
                                                className={getStatusClass(
                                                    project.status
                                                )}
                                            >
                                                {formatStatus(
                                                    project.status
                                                )}
                                            </span>

                                        </div>

                                        <p className="my-project-description">
                                            {project.description}
                                        </p>

                                    </div>

                                </div>

                                {/* =================================================
                                    PROJECT DETAILS
                                ================================================= */}

                                <div className="my-project-details">

                                    <div>
                                        <span>
                                            Budget Type
                                        </span>

                                        <strong>
                                            {project.budget_type}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Budget
                                        </span>

                                        <strong>
                                            ₹
                                            {project.budget_amount}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Priority
                                        </span>

                                        <strong>
                                            {project.priority}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Deadline
                                        </span>

                                        <strong>
                                            {project.deadline}
                                        </strong>
                                    </div>

                                </div>

                                {/* =================================================
                                    ACTIONS
                                ================================================= */}

                                <div className="my-project-card-footer">

                                    <span className="project-id">
                                        Project #{project.id}
                                    </span>

                                    <div className="my-project-actions">

                                        <button
                                            className="view-project-button"
                                            onClick={() =>
                                                handleViewProject(
                                                    project.id
                                                )
                                            }
                                        >
                                            View Project
                                        </button>

                                        {project.status ===
                                            "OPEN" && (
                                            <button
                                                className="edit-project-button"
                                                onClick={() =>
                                                    navigate(
                                                        `/projects/${project.id}/edit`
                                                    )
                                                }
                                            >
                                                Edit
                                            </button>
                                        )}

                                    </div>

                                </div>

                            </div>

                        ))}

                    </div>

                )}

            </main>

        </div>
    );
}

export default MyProjects;
