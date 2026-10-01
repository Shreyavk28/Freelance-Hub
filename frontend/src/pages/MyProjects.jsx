import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import FreelancerNavbar from "../components/FreelancerNavbar";
import api from "../services/api";

import "./MyProjects.css";


function MyProjects() {

    const navigate = useNavigate();

    const { user, logout } = useAuth();


    /* =========================================
       STATE
    ========================================= */

    const [projects, setProjects] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    /* =========================================
       USER ROLE
    ========================================= */

    const isFreelancer =
        user?.role === "FREELANCER";

    const isClient =
        user?.role === "CLIENT";


    /* =========================================
       LOAD MY PROJECTS
    ========================================= */

    useEffect(() => {

        if (!user) {
            return;
        }

        loadProjects();

    }, [user]);


    const loadProjects = async () => {

        try {

            setLoading(true);

            setError("");


            /*
             * IMPORTANT:
             *
             * /projects/my/
             * returns projects created by the
             * currently authenticated user.
             *
             * Do NOT use /projects/ here because
             * that endpoint is for available/open
             * projects.
             */

            const response =
                await api.get(
                    "/projects/my/"
                );


            let data = response.data;


            /*
             * Handle both:
             *
             * [
             *   project1,
             *   project2
             * ]
             *
             * and paginated:
             *
             * {
             *   results: [...]
             * }
             */

            let myProjects = [];

            if (Array.isArray(data)) {

                myProjects = data;

            } else if (
                data &&
                Array.isArray(data.results)
            ) {

                myProjects =
                    data.results;

            }


            /*
             * Safety check:
             *
             * The backend should already return
             * only the logged-in user's projects.
             *
             * We additionally filter by the owner
             * information when that information is
             * available in the serializer response.
             *
             * If the serializer does not provide an
             * owner/client field, we keep the backend
             * result unchanged.
             */

            const currentUserId =
                user?.id;


            const currentUsername =
                user?.username;


            const hasOwnerInformation =
                myProjects.some(
                    (project) =>
                        project.client !== undefined ||
                        project.client_id !== undefined ||
                        project.client_username !== undefined ||
                        project.owner !== undefined ||
                        project.owner_id !== undefined
                );


            if (
                hasOwnerInformation &&
                currentUserId !== undefined
            ) {

                myProjects =
                    myProjects.filter(
                        (project) => {

                            /*
                             * client can be:
                             * - integer ID
                             * - object
                             */

                            if (
                                project.client !==
                                    undefined &&
                                project.client !==
                                    null
                            ) {

                                if (
                                    typeof project.client ===
                                    "object"
                                ) {

                                    return String(
                                        project.client.id
                                    ) ===
                                    String(
                                        currentUserId
                                    );

                                }

                                return String(
                                    project.client
                                ) ===
                                String(
                                    currentUserId
                                );
                            }


                            if (
                                project.client_id !==
                                    undefined &&
                                project.client_id !==
                                    null
                            ) {

                                return String(
                                    project.client_id
                                ) ===
                                String(
                                    currentUserId
                                );
                            }


                            if (
                                project.owner !==
                                    undefined &&
                                project.owner !==
                                    null
                            ) {

                                if (
                                    typeof project.owner ===
                                    "object"
                                ) {

                                    return String(
                                        project.owner.id
                                    ) ===
                                    String(
                                        currentUserId
                                    );

                                }

                                return String(
                                    project.owner
                                ) ===
                                String(
                                    currentUserId
                                );
                            }


                            if (
                                project.owner_id !==
                                    undefined &&
                                project.owner_id !==
                                    null
                            ) {

                                return String(
                                    project.owner_id
                                ) ===
                                String(
                                    currentUserId
                                );
                            }


                            /*
                             * If only username is available.
                             */

                            if (
                                project.client_username !==
                                    undefined
                            ) {

                                return (
                                    project.client_username ===
                                    currentUsername
                                );

                            }


                            /*
                             * If no matching owner
                             * information is available,
                             * don't keep the project.
                             */

                            return false;
                        }
                    );

            }


            /*
             * Sort newest projects first.
             */

            myProjects.sort(
                (a, b) => {

                    const dateA =
                        new Date(
                            a.created_at || 0
                        ).getTime();

                    const dateB =
                        new Date(
                            b.created_at || 0
                        ).getTime();

                    return dateB - dateA;
                }
            );


            setProjects(
                myProjects
            );


        } catch (err) {

            console.error(
                "My projects error:",
                err
            );


            setProjects([]);


            setError(
                err.response?.data?.detail ||
                "Unable to load your projects."
            );


        } finally {

            setLoading(false);

        }
    };


    /* =========================================
       LOGOUT
    ========================================= */

    const handleLogout = () => {

        logout();

        navigate("/login");

    };


    /* =========================================
       VIEW PROJECT
    ========================================= */

    const handleViewProject = (
        projectId
    ) => {

        if (!projectId) {
            return;
        }

        navigate(
            `/projects/${projectId}`
        );

    };


    /* =========================================
       CREATE PROJECT
    ========================================= */

    const handleCreateProject = () => {

        navigate(
            "/projects/create"
        );

    };


    /* =========================================
       STATUS CLASS
    ========================================= */

    const getStatusClass = (
        status
    ) => {

        if (!status) {
            return "my-project-status";
        }

        return (
            "my-project-status " +
            `my-project-status-${String(
                status
            ).toLowerCase()}`
        );

    };


    /* =========================================
       FORMAT STATUS
    ========================================= */

    const formatStatus = (
        status
    ) => {

        if (!status) {
            return "Unknown";
        }

        return String(status)
            .replace(/_/g, " ")
            .toLowerCase()
            .replace(
                /\b\w/g,
                (letter) =>
                    letter.toUpperCase()
            );

    };


    /* =========================================
       FORMAT DATE
    ========================================= */

    const formatDate = (
        date
    ) => {

        if (!date) {
            return "Not available";
        }

        const parsedDate =
            new Date(date);


        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {

            return date;

        }


        return parsedDate.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );

    };


    /* =========================================
       CLIENT NAVBAR
    ========================================= */

    const renderClientNavbar = () => (

        <header className="my-projects-navbar">

            <div
                className="my-projects-logo"
                onClick={() =>
                    navigate(
                        "/client/dashboard"
                    )
                }
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
                        navigate(
                            "/client/dashboard"
                        )
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
                    onClick={() =>
                        navigate(
                            "/projects"
                        )
                    }
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
                        navigate(
                            "/find-freelancers"
                        )
                    }
                >
                    Find Freelancers
                </button>

            </nav>


            <div className="my-projects-user">

                <span>
                    {user?.username}
                </span>


                <button
                    onClick={
                        handleLogout
                    }
                >
                    Logout
                </button>

            </div>

        </header>

    );


    /* =========================================
       LOADING
    ========================================= */

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


    /* =========================================
       MAIN UI
    ========================================= */

    return (

        <div className="my-projects-page">


            {/* =================================
                ROLE-BASED NAVBAR
            ================================= */}

            {isFreelancer ? (

                <FreelancerNavbar />

            ) : (

                renderClientNavbar()

            )}


            {/* =================================
                MAIN
            ================================= */}

            <main className="my-projects-container">


                {/* =================================
                    HEADER
                ================================= */}

                <div className="my-projects-header">

                    <div>

                        <div className="my-projects-label">

                            {isFreelancer
                                ? "FREELANCER WORKSPACE"
                                : "CLIENT WORKSPACE"}

                        </div>


                        <h1>
                            My Projects
                        </h1>


                        <p>

                            {isFreelancer

                                ? "Manage projects you have posted and review proposals from other freelancers."

                                : "Manage your projects and review freelancer proposals."}

                        </p>

                    </div>


                    <button
                        className="create-project-button"
                        onClick={
                            handleCreateProject
                        }
                    >
                        + Create Project
                    </button>

                </div>


                {/* =================================
                    ERROR
                ================================= */}

                {error && (

                    <div className="my-projects-error">

                        {error}

                        <button
                            type="button"
                            onClick={
                                loadProjects
                            }
                        >
                            Retry
                        </button>

                    </div>

                )}


                {/* =================================
                    EMPTY STATE
                ================================= */}

                {!error &&
                    projects.length === 0 && (

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
                                onClick={
                                    handleCreateProject
                                }
                            >
                                Create Your First Project
                            </button>

                        </div>

                    )}


                {/* =================================
                    PROJECT LIST
                ================================= */}

                {projects.length > 0 && (

                    <div className="my-projects-list">

                        {projects.map(
                            (project) => (

                                <div
                                    className="my-project-card"
                                    key={
                                        project.id
                                    }
                                >


                                    {/* =========================
                                        TOP
                                    ========================= */}

                                    <div className="my-project-card-top">

                                        <div>

                                            <div className="my-project-title-row">

                                                <h2>
                                                    {
                                                        project.title
                                                    }
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

                                                {
                                                    project.description
                                                }

                                            </p>

                                        </div>

                                    </div>


                                    {/* =========================
                                        DETAILS
                                    ========================= */}

                                    <div className="my-project-details">


                                        <div>

                                            <span>
                                                Budget Type
                                            </span>

                                            <strong>
                                                {
                                                    project.budget_type
                                                }
                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Budget
                                            </span>

                                            <strong>

                                                ₹
                                                {
                                                    project.budget_amount
                                                }

                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Priority
                                            </span>

                                            <strong>
                                                {
                                                    project.priority
                                                }
                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Deadline
                                            </span>

                                            <strong>
                                                {formatDate(
                                                    project.deadline
                                                )}
                                            </strong>

                                        </div>

                                    </div>


                                    {/* =========================
                                        FOOTER
                                    ========================= */}

                                    <div className="my-project-card-footer">


                                        <span className="project-id">

                                            Project #
                                            {
                                                project.id
                                            }

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

                            )
                        )}

                    </div>

                )}

            </main>

        </div>

    );

}


export default MyProjects;