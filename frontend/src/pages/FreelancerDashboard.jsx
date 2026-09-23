import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

import "./Dashboard.css";
import "./FreelancerDashboard.css";
import FreelancerNavbar from "../components/FreelancerNavbar";


function FreelancerDashboard() {

    const navigate = useNavigate();

    const { user, logout } = useAuth();

    const [projects, setProjects] = useState([]);

    const [proposals, setProposals] = useState([]);

    const [invitations, setInvitations] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    // =========================================================
    // LOAD DASHBOARD DATA
    // =========================================================

    useEffect(() => {

        fetchDashboardData();

    }, []);


    const fetchDashboardData = async () => {

        try {

            setLoading(true);

            setError("");


            const [
                projectsResponse,
                proposalsResponse,
                invitationsResponse
            ] = await Promise.all([

                api.get("/projects/"),

                api.get("/proposals/my/"),

                api.get("/collaborations/freelancer/")

            ]);


            setProjects(
                projectsResponse.data
            );

            setProposals(
                proposalsResponse.data
            );

            setInvitations(
                Array.isArray(
                    invitationsResponse.data
                )
                    ? invitationsResponse.data
                    : []
            );


        } catch (error) {

            console.error(
                "Freelancer dashboard error:",
                error
            );


            setError(
                error.response?.data?.detail ||
                "Unable to load dashboard data."
            );

        } finally {

            setLoading(false);

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
    // STATISTICS
    // =========================================================

    const totalProposals =
        proposals.length;


    const activeProposals =
        proposals.filter(
            (proposal) =>
                proposal.status === "PENDING"
        ).length;


    const acceptedProposals =
        proposals.filter(
            (proposal) =>
                proposal.status === "ACCEPTED"
        ).length;


    const pendingInvitations =
        invitations.filter(
            (invitation) =>
                invitation.status === "PENDING"
        ).length;


    const completedProjects = 0;


    // =========================================================
    // RECOMMENDED PROJECTS
    // =========================================================

    const recommendedProjects =
        [...projects]
            .sort(
                (a, b) =>
                    (b.skill_match_percentage || 0) -
                    (a.skill_match_percentage || 0)
            )
            .slice(0, 3);


    // =========================================================
    // RENDER
    // =========================================================

    return (

        <div className="dashboard-page">


            <FreelancerNavbar />


            {/* =================================================
                MAIN
            ================================================= */}

            <main className="dashboard-content">


                {/* =================================================
                    WELCOME
                ================================================= */}

                <section className="dashboard-welcome">


                    <div>


                        <p className="dashboard-label">
                            FREELANCER DASHBOARD
                        </p>


                        <h1>
                            Welcome back,{" "}
                            {user?.username} 👋
                        </h1>


                        <p>
                            Discover projects that match
                            your skills and grow your
                            freelance career.
                        </p>


                    </div>


                    <button
                        className="primary-button"
                        onClick={() =>
                            navigate(
                                "/browse-projects"
                            )
                        }
                    >
                        Browse Projects
                    </button>


                </section>


                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (

                    <div className="dashboard-error">
                        {error}
                    </div>

                )}


                {/* =================================================
                    STATISTICS
                ================================================= */}

                <section className="dashboard-stats">


                    <div className="stat-card">

                        <span>
                            Total Proposals
                        </span>

                        <strong>
                            {loading
                                ? "..."
                                : totalProposals}
                        </strong>

                    </div>


                    <div className="stat-card">

                        <span>
                            Active Proposals
                        </span>

                        <strong>
                            {loading
                                ? "..."
                                : activeProposals}
                        </strong>

                    </div>


                    <div className="stat-card">

                        <span>
                            Accepted Proposals
                        </span>

                        <strong>
                            {loading
                                ? "..."
                                : acceptedProposals}
                        </strong>

                    </div>


                    <div className="stat-card">

                        <span>
                            Invitations
                        </span>

                        <strong>
                            {loading
                                ? "..."
                                : pendingInvitations}
                        </strong>

                    </div>


                    <div className="stat-card">

                        <span>
                            Completed Projects
                        </span>

                        <strong>
                            {completedProjects}
                        </strong>

                    </div>


                </section>


                {/* =================================================
                    QUICK ACTIONS
                ================================================= */}

                <section className="dashboard-section">


                    <div className="section-header">


                        <div>

                            <h2>
                                Quick Actions
                            </h2>

                            <p>
                                Manage your freelance work.
                            </p>

                        </div>


                    </div>


                    <div className="quick-actions">


                        {/* Browse Projects */}

                        <button
                            className="action-card"
                            onClick={() =>
                                navigate(
                                    "/browse-projects"
                                )
                            }
                        >

                            <span className="action-icon">
                                🔍
                            </span>


                            <div>

                                <h3>
                                    Browse Projects
                                </h3>

                                <p>
                                    Find projects that
                                    match your skills.
                                </p>

                            </div>

                        </button>


                        {/* My Proposals */}

                        <button
                            className="action-card"
                            onClick={() =>
                                navigate(
                                    "/proposals"
                                )
                            }
                        >

                            <span className="action-icon">
                                📄
                            </span>


                            <div>

                                <h3>
                                    My Proposals
                                </h3>

                                <p>
                                    Track the proposals
                                    you have submitted.
                                </p>

                            </div>

                        </button>


                        {/* Invitations */}

                        <button
                            className="action-card"
                            onClick={() =>
                                navigate(
                                    "/invitations"
                                )
                            }
                        >

                            <span className="action-icon">
                                📩
                            </span>


                            <div>

                                <h3>
                                    Invitations

                                    {pendingInvitations >
                                        0 && (
                                        <span className="quick-action-count">
                                            {pendingInvitations}
                                        </span>
                                    )}

                                </h3>

                                <p>
                                    Review project
                                    invitations from clients.
                                </p>

                            </div>

                        </button>


                        {/* Profile */}

                        <button
                            className="action-card"
                            onClick={() =>
                                navigate(
                                    "/profile/freelancer"
                                )
                            }
                        >

                            <span className="action-icon">
                                👤
                            </span>


                            <div>

                                <h3>
                                    My Profile
                                </h3>

                                <p>
                                    Update your skills,
                                    experience and profile.
                                </p>

                            </div>

                        </button>


                    </div>


                </section>


                {/* =================================================
                    RECOMMENDED PROJECTS
                ================================================= */}

                <section className="dashboard-section">


                    <div className="section-header">


                        <div>

                            <h2>
                                Recommended Projects
                            </h2>

                            <p>
                                Projects ranked by your
                                skill match.
                            </p>

                        </div>


                        <button
                            className="text-button"
                            onClick={() =>
                                navigate(
                                    "/browse-projects"
                                )
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

                    ) : recommendedProjects.length === 0 ? (

                        <div className="empty-state">


                            <div className="empty-icon">
                                🔍
                            </div>


                            <h3>
                                No projects available
                            </h3>


                            <p>
                                New projects will appear
                                here when clients post them.
                            </p>


                            <button
                                className="primary-button"
                                onClick={() =>
                                    navigate(
                                        "/browse-projects"
                                    )
                                }
                            >
                                Browse Projects
                            </button>


                        </div>

                    ) : (

                        <div className="freelancer-project-list">


                            {recommendedProjects.map(
                                (project) => (

                                    <div
                                        className="freelancer-project-card"
                                        key={project.id}
                                        onClick={() =>
                                            navigate(
                                                `/projects/${project.id}`
                                            )
                                        }
                                        role="button"
                                        tabIndex="0"
                                    >


                                        <div className="freelancer-project-main">


                                            <div className="freelancer-project-title">


                                                <h3>
                                                    {project.title}
                                                </h3>


                                                <span className="match-badge">

                                                    {
                                                        project.skill_match_percentage
                                                    }%

                                                    {" "}

                                                    Match

                                                </span>


                                            </div>


                                            <p>
                                                {
                                                    project.description
                                                }
                                            </p>


                                            <div className="project-meta">


                                                <span>
                                                    {
                                                        project.budget_type
                                                    }
                                                </span>


                                                <span>
                                                    ₹
                                                    {
                                                        project.budget_amount
                                                    }
                                                </span>


                                                <span>
                                                    Due:{" "}
                                                    {
                                                        project.deadline
                                                    }
                                                </span>


                                            </div>


                                            <div className="project-skills">


                                                {project.required_skill_names?.map(
                                                    (skill) => (

                                                        <span
                                                            key={skill}
                                                            className="skill-tag"
                                                        >
                                                            {skill}
                                                        </span>

                                                    )
                                                )}


                                            </div>


                                        </div>


                                        <div>


                                            <span
                                                className={
                                                    `status-badge status-` +
                                                    `${project.status.toLowerCase()}`
                                                }
                                            >
                                                {
                                                    project.status.replace(
                                                        "_",
                                                        " "
                                                    )
                                                }
                                            </span>


                                        </div>


                                    </div>

                                )
                            )}


                        </div>

                    )}


                </section>


            </main>

        </div>
    );
}


export default FreelancerDashboard;