import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./Dashboard.css";

function ClientDashboard() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const [projects, setProjects] = useState([]);
    const [proposalCount, setProposalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError("");

            // Get projects created by this client
            const projectsResponse = await api.get("/projects/my/");

            const projectData = projectsResponse.data;

            setProjects(projectData);

            // Get proposals received for all projects
            if (projectData.length > 0) {
                const proposalResponses = await Promise.all(
                    projectData.map((project) =>
                        api.get(`/proposals/project/${project.id}/`)
                    )
                );

                const totalProposals = proposalResponses.reduce(
                    (total, response) => {
                        return total + response.data.length;
                    },
                    0
                );

                setProposalCount(totalProposals);
            } else {
                setProposalCount(0);
            }

        } catch (error) {
            console.error("Dashboard error:", error);

            setError(
                error.response?.data?.detail ||
                "Unable to load dashboard data."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    /*
     * Dashboard statistics
     */

    // Total number of projects created by this client
    const totalProjects = projects.length;

    // Active means OPEN or IN_PROGRESS
    const activeProjects = projects.filter(
    (project) => project.status === "IN_PROGRESS"
).length;

    // Completed projects
    const completedProjects = projects.filter(
        (project) =>
            project.status === "COMPLETED"
    ).length;

    // Saved freelancers will be connected to the
    // save/bookmark feature later.
    const savedFreelancers = 0;

    // Show latest 3 projects
    const recentProjects = projects.slice(0, 3);

    return (
        <div className="dashboard-page">

            {/* ================================
                Navbar
            ================================= */}

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
                        onClick={() =>
                            navigate("/projects")
                        }
                    >
                        My Projects
                    </button>

                    <button
                        onClick={() =>
                            navigate("/find-freelancers")
                        }
                    >
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

            {/* ================================
                Main Content
            ================================= */}

            <main className="dashboard-content">

                {/* Welcome */}

                <section className="dashboard-welcome">

                    <div>

                        <p className="dashboard-label">
                            CLIENT DASHBOARD
                        </p>

                        <h1>
                            Welcome back, {user?.username} 👋
                        </h1>

                        <p>
                            Manage your projects, find skilled
                            freelancers, and collaborate with your
                            team.
                        </p>

                    </div>

                    <button
                        className="primary-button"
                        onClick={() =>
                            navigate("/projects/create")
                        }
                    >
                        + Post a Project
                    </button>

                </section>

                {/* Error */}

                {error && (
                    <div className="dashboard-error">
                        {error}
                    </div>
                )}

                {/* ================================
                    Statistics
                ================================= */}

                <section className="dashboard-stats">

                    {/* Total Projects */}

                    <div className="stat-card">

                        <span>
                            Total Projects
                        </span>

                        <strong>
                            {loading ? "..." : totalProjects}
                        </strong>

                    </div>

                    {/* Active Projects */}

                    <div className="stat-card">

                        <span>
                            Active Projects
                        </span>

                        <strong>
                            {loading ? "..." : activeProjects}
                        </strong>

                    </div>

                    {/* Proposals */}

                    <div className="stat-card">

                        <span>
                            Proposals Received
                        </span>

                        <strong>
                            {loading ? "..." : proposalCount}
                        </strong>

                    </div>

                    {/* Completed */}

                    <div className="stat-card">

                        <span>
                            Projects Completed
                        </span>

                        <strong>
                            {loading ? "..." : completedProjects}
                        </strong>

                    </div>

                    {/* Saved Freelancers */}

                    <div className="stat-card">

                        <span>
                            Saved Freelancers
                        </span>

                        <strong>
                            {savedFreelancers}
                        </strong>

                    </div>

                </section>

                {/* ================================
                    Quick Actions
                ================================= */}

                <section className="dashboard-section">

                    <div className="section-header">

                        <div>

                            <h2>
                                Quick Actions
                            </h2>

                            <p>
                                Get started with your next project.
                            </p>

                        </div>

                    </div>

                    <div className="quick-actions">

                        {/* Post Project */}

                        <button
                            onClick={() =>
                                navigate("/projects/create")
                            }
                            className="action-card"
                        >

                            <span className="action-icon">
                                +
                            </span>

                            <div>

                                <h3>
                                    Post a Project
                                </h3>

                                <p>
                                    Tell freelancers what you
                                    need help with.
                                </p>

                            </div>

                        </button>

                        {/* Find Freelancers */}

                        <button
                            className="action-card"
                            onClick={() =>
                                navigate("/freelancers")
                            }
                        >

                            <span className="action-icon">
                                🔍
                            </span>

                            <div>

                                <h3>
                                    Find Freelancers
                                </h3>

                                <p>
                                    Search professionals by
                                    skills and experience.
                                </p>

                            </div>

                        </button>

                        {/* Messages */}

                        <button
                            className="action-card"
                            onClick={() =>
                                navigate("/messages")
                            }
                        >

                            <span className="action-icon">
                                💬
                            </span>

                            <div>

                                <h3>
                                    Messages
                                </h3>

                                <p>
                                    Communicate with your
                                    freelancers.
                                </p>

                            </div>

                        </button>

                    </div>

                </section>

                {/* ================================
                    Recent Projects
                ================================= */}

                <section className="dashboard-section">

                    <div className="section-header">

                        <div>

                            <h2>
                                Recent Projects
                            </h2>

                            <p>
                                Your latest projects.
                            </p>

                        </div>

                        <button
                            className="text-button"
                            onClick={() =>
                                navigate("/projects")
                            }
                        >
                            View all
                        </button>

                    </div>

                    {loading ? (

                        <div className="empty-state">

                            <h3>
                                Loading projects...
                            </h3>

                        </div>

                    ) : recentProjects.length === 0 ? (

                        <div className="empty-state">

                            <div className="empty-icon">
                                📁
                            </div>

                            <h3>
                                No projects yet
                            </h3>

                            <p>
                                Create your first project and
                                start receiving proposals from
                                freelancers.
                            </p>

                            <button
                                className="primary-button"
                                onClick={() =>
                                    navigate("/projects/create")
                                }
                            >
                                Post Your First Project
                            </button>

                        </div>

                    ) : (

                        <div className="recent-project-list">

                            {recentProjects.map((project) => (

                                <div
                                    className="project-preview-card"
                                    key={project.id}
                                    onClick={() =>
                                        navigate(
                                            `/projects/${project.id}`
                                        )
                                    }
                                    role="button"
                                    tabIndex="0"
                                >

                                    <div className="project-preview-main">

                                        <h3>
                                            {project.title}
                                        </h3>

                                        <p>
                                            {project.description}
                                        </p>

                                        <div className="project-meta">

                                            <span>
                                                {project.budget_type}
                                            </span>

                                            <span>
                                                ₹{project.budget_amount}
                                            </span>

                                            <span>
                                                Due: {project.deadline}
                                            </span>

                                        </div>

                                    </div>

                                    <div>

                                        <span
                                            className={`status-badge status-${project.status.toLowerCase()}`}
                                        >
                                            {project.status.replace(
                                                "_",
                                                " "
                                            )}
                                        </span>

                                    </div>

                                </div>

                            ))}

                        </div>

                    )}

                </section>

            </main>

        </div>
    );
}

export default ClientDashboard;