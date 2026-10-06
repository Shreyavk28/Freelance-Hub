
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./Dashboard.css";

function getList(data) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    return [];
}

function ClientDashboard() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const [projects, setProjects] = useState([]);
    const [proposalCount, setProposalCount] = useState(0);
    const [savedFreelancerCount, setSavedFreelancerCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        setError("");

        try {
            const [projectsResult, savedResult] = await Promise.allSettled([
                api.get("/projects/my/"),
                api.get("/profiles/saved-freelancers/"),
            ]);

            let projectList = [];

            if (projectsResult.status === "fulfilled") {
                projectList = getList(projectsResult.value.data);
                setProjects(projectList);
            } else {
                console.error(
                    "Projects loading error:",
                    projectsResult.reason
                );
                setProjects([]);
                setError(
                    projectsResult.reason?.response?.data?.detail ||
                    "Unable to load projects."
                );
            }

            if (savedResult.status === "fulfilled") {
                const savedList = getList(savedResult.value.data);
                setSavedFreelancerCount(savedList.length);
            } else {
                console.error(
                    "Saved freelancers loading error:",
                    savedResult.reason
                );
                setSavedFreelancerCount(0);
            }

            if (projectList.length > 0) {
                const proposalResponses = await Promise.allSettled(
                    projectList.map((project) =>
                        api.get(`/proposals/project/${project.id}/`)
                    )
                );

                const totalProposals = proposalResponses.reduce(
                    (total, result) => {
                        if (result.status !== "fulfilled") return total;
                        return total + getList(result.value.data).length;
                    },
                    0
                );

                setProposalCount(totalProposals);
            } else {
                setProposalCount(0);
            }
        } catch (err) {
            console.error("Dashboard error:", err);
            setError(
                err.response?.data?.detail ||
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

    const totalProjects = projects.length;

    const activeProjects = projects.filter(
        (project) => project.status === "IN_PROGRESS"
    ).length;

    const completedProjects = projects.filter(
        (project) => project.status === "COMPLETED"
    ).length;

    const recentProjects = projects.slice(0, 3);

    return (
        <div className="dashboard-page">
            <header className="dashboard-navbar">
                <div className="dashboard-logo">FreelanceHub</div>

                <nav className="dashboard-nav">
                    <button onClick={() => navigate("/client/dashboard")}>
                        Dashboard
                    </button>

                    <button onClick={() => navigate("/projects")}>
                        My Projects
                    </button>

                    <button onClick={() => navigate("/find-freelancers")}>
                        Find Freelancers
                    </button>
                </nav>

                <div className="dashboard-user">
                    <span>{user?.username}</span>

                    <button
                        className="logout-button"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </div>
            </header>

            <main className="dashboard-content">
                <section className="dashboard-welcome">
                    <div>
                        <p className="dashboard-label">CLIENT DASHBOARD</p>
                        <h1>Welcome back, {user?.username} 👋</h1>
                        <p>
                            Manage your projects, find skilled freelancers,
                            and collaborate with your team.
                        </p>
                    </div>

                    <button
                        className="primary-button"
                        onClick={() => navigate("/projects/create")}
                    >
                        + Post a Project
                    </button>
                </section>

                {error && (
                    <div className="dashboard-error" role="alert">
                        {error}
                    </div>
                )}

                <section className="dashboard-stats">
                    <div className="stat-card">
                        <span>Total Projects</span>
                        <strong>{loading ? "..." : totalProjects}</strong>
                    </div>

                    <div className="stat-card">
                        <span>Active Projects</span>
                        <strong>{loading ? "..." : activeProjects}</strong>
                    </div>

                    <div className="stat-card">
                        <span>Proposals Received</span>
                        <strong>{loading ? "..." : proposalCount}</strong>
                    </div>

                    <div className="stat-card">
                        <span>Projects Completed</span>
                        <strong>{loading ? "..." : completedProjects}</strong>
                    </div>

                    <div className="stat-card">
                        <span>Saved Freelancers</span>
                        <strong>
                            {loading ? "..." : savedFreelancerCount}
                        </strong>
                    </div>
                </section>

                <section className="dashboard-section">
                    <div className="section-header">
                        <div>
                            <h2>Quick Actions</h2>
                            <p>Get started with your next project.</p>
                        </div>
                    </div>

                    <div className="quick-actions">
                        <button
                            className="action-card"
                            onClick={() => navigate("/projects/create")}
                        >
                            <span className="action-icon">+</span>
                            <div>
                                <h3>Post a Project</h3>
                                <p>
                                    Tell freelancers what you need help with.
                                </p>
                            </div>
                        </button>

                        <button
                            className="action-card"
                            onClick={() => navigate("/find-freelancers")}
                        >
                            <span className="action-icon">🔍</span>
                            <div>
                                <h3>Find Freelancers</h3>
                                <p>
                                    Search professionals by skills and
                                    experience.
                                </p>
                            </div>
                        </button>

                        <button
                            className="action-card"
                            onClick={() =>
                                navigate("/find-freelancers")
                            }
                        >
                            <span className="action-icon">♥</span>
                            <div>
                                <h3>Saved Freelancers</h3>
                                <p>
                                    Browse freelancers and manage your saved
                                    list.
                                </p>
                            </div>
                        </button>

                        <button
                            className="action-card"
                            onClick={() => navigate("/messages")}
                        >
                            <span className="action-icon">💬</span>
                            <div>
                                <h3>Messages</h3>
                                <p>
                                    Communicate with your freelancers.
                                </p>
                            </div>
                        </button>
                    </div>
                </section>

                <section className="dashboard-section">
                    <div className="section-header">
                        <div>
                            <h2>Recent Projects</h2>
                            <p>Your latest projects.</p>
                        </div>

                        <button
                            className="text-button"
                            onClick={() => navigate("/projects")}
                        >
                            View all
                        </button>
                    </div>

                    {loading ? (
                        <div className="empty-state">
                            <h3>Loading projects...</h3>
                        </div>
                    ) : recentProjects.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">📁</div>
                            <h3>No projects yet</h3>
                            <p>
                                Create your first project and start receiving
                                proposals from freelancers.
                            </p>

                            <button
                                className="primary-button"
                                onClick={() => navigate("/projects/create")}
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
                                        navigate(`/projects/${project.id}`)
                                    }
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(event) => {
                                        if (
                                            event.key === "Enter" ||
                                            event.key === " "
                                        ) {
                                            navigate(
                                                `/projects/${project.id}`
                                            );
                                        }
                                    }}
                                >
                                    <div className="project-preview-main">
                                        <h3>{project.title}</h3>
                                        <p>{project.description}</p>

                                        <div className="project-meta">
                                            <span>{project.budget_type}</span>
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
                                            className={`status-badge status-${(
                                                project.status || ""
                                            ).toLowerCase()}`}
                                        >
                                            {(project.status || "").replace(
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
