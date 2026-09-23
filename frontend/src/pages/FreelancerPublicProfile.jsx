import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./FreelancerPublicProfile.css";

function FreelancerPublicProfile() {
    const navigate = useNavigate();
    const { freelancerId } = useParams();
    const { user, logout } = useAuth();

    // =========================================================
    // PROFILE STATE
    // =========================================================

    const [freelancer, setFreelancer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // =========================================================
    // INVITATION STATE
    // =========================================================

    const [showInviteForm, setShowInviteForm] = useState(false);

    const [projects, setProjects] = useState([]);
    const [projectsLoading, setProjectsLoading] = useState(false);

    const [selectedProject, setSelectedProject] = useState("");
    const [inviteMessage, setInviteMessage] = useState("");

    const [inviteLoading, setInviteLoading] = useState(false);
    const [inviteError, setInviteError] = useState("");
    const [inviteSuccess, setInviteSuccess] = useState("");

    // =========================================================
    // LOAD FREELANCER
    // =========================================================

    useEffect(() => {
        if (freelancerId) {
            loadFreelancer();
        }
    }, [freelancerId]);

    const loadFreelancer = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                `/profiles/freelancers/${freelancerId}/`
            );

            setFreelancer(response.data);
        } catch (error) {
            console.error(
                "Freelancer profile loading error:",
                error
            );

            setError(
                error.response?.data?.detail ||
                    "Unable to load freelancer profile."
            );
        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // LOAD CLIENT PROJECTS
    // =========================================================

    const loadProjects = async () => {
        try {
            setProjectsLoading(true);
            setInviteError("");

            const response = await api.get(
                "/projects/my/"
            );

            const projectList = Array.isArray(response.data)
                ? response.data
                : response.data?.results || [];

            // Only OPEN projects can receive invitations.
            const openProjects = projectList.filter(
                (project) =>
                    project.status === "OPEN"
            );

            setProjects(openProjects);

            // Automatically select if there is only
            // one open project.
            if (openProjects.length === 1) {
                setSelectedProject(
                    String(openProjects[0].id)
                );
            } else {
                setSelectedProject("");
            }
        } catch (error) {
            console.error(
                "Projects loading error:",
                error
            );

            setInviteError(
                error.response?.data?.detail ||
                    "Unable to load your projects."
            );
        } finally {
            setProjectsLoading(false);
        }
    };

    // =========================================================
    // OPEN INVITATION FORM
    // =========================================================

    const handleOpenInvite = () => {
        setShowInviteForm(true);

        setInviteError("");
        setInviteSuccess("");

        setSelectedProject("");
        setInviteMessage("");

        loadProjects();
    };

    // =========================================================
    // CLOSE INVITATION FORM
    // =========================================================

    const handleCloseInvite = () => {
        if (inviteLoading) {
            return;
        }

        setShowInviteForm(false);

        setInviteError("");
        setInviteSuccess("");

        setSelectedProject("");
        setInviteMessage("");
    };

    // =========================================================
    // SEND INVITATION
    // =========================================================

    const handleSendInvitation = async (event) => {
        event.preventDefault();

        setInviteError("");
        setInviteSuccess("");

        // -----------------------------------------------------
        // VALIDATION
        // -----------------------------------------------------

        if (!selectedProject) {
            setInviteError(
                "Please select a project."
            );
            return;
        }

        if (!inviteMessage.trim()) {
            setInviteError(
                "Please enter a message."
            );
            return;
        }

        if (!freelancerId) {
            setInviteError(
                "Freelancer information is missing."
            );
            return;
        }

        try {
            setInviteLoading(true);

            /*
             * IMPORTANT:
             *
             * api.js already has:
             *
             * baseURL = http://127.0.0.1:8000/api
             *
             * Therefore:
             *
             * /collaborations/invite/
             *
             * becomes:
             *
             * /api/collaborations/invite/
             */

            const response = await api.post(
                "/collaborations/invite/",
                {
                    project: Number(selectedProject),

                    /*
                     * freelancerId here is the
                     * FreelancerProfile ID.
                     */
                    freelancer: Number(freelancerId),

                    message: inviteMessage.trim(),
                }
            );

            console.log(
                "Invitation sent successfully:",
                response.data
            );

            setInviteSuccess(
                "Invitation sent successfully."
            );

            setInviteError("");

            // Clear form fields after successful request.
            setSelectedProject("");
            setInviteMessage("");

        } catch (error) {
            console.error(
                "Invitation error:",
                error
            );

            const responseData =
                error.response?.data;

            // -------------------------------------------------
            // Django / DRF ERROR HANDLING
            // -------------------------------------------------

            if (
                responseData &&
                typeof responseData === "object"
            ) {
                const messages = Object.entries(
                    responseData
                )
                    .map(([field, value]) => {
                        const text = Array.isArray(value)
                            ? value.join(" ")
                            : String(value);

                        return `${field}: ${text}`;
                    })
                    .join(" | ");

                setInviteError(
                    messages ||
                        "Unable to send invitation."
                );
            } else if (responseData) {
                setInviteError(
                    String(responseData)
                );
            } else {
                setInviteError(
                    "Unable to send invitation. Please try again."
                );
            }

            setInviteSuccess("");
        } finally {
            setInviteLoading(false);
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
    // FORMAT HOURLY RATE
    // =========================================================

    const formatRate = (rate) => {
        if (
            rate === null ||
            rate === undefined ||
            rate === ""
        ) {
            return "Not specified";
        }

        return `₹${Number(rate).toLocaleString(
            "en-IN"
        )}/hr`;
    };

    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {
        return (
            <div className="public-profile-page">

                <header className="public-profile-navbar">

                    <div
                        className="public-profile-logo"
                        onClick={() =>
                            navigate(
                                "/client/dashboard"
                            )
                        }
                    >
                        FreelanceHub
                    </div>

                </header>

                <main className="public-profile-container">

                    <div className="public-profile-loading">
                        Loading freelancer profile...
                    </div>

                </main>

            </div>
        );
    }

    // =========================================================
    // ERROR
    // =========================================================

    if (error || !freelancer) {
        return (
            <div className="public-profile-page">

                <header className="public-profile-navbar">

                    <div
                        className="public-profile-logo"
                        onClick={() =>
                            navigate(
                                "/client/dashboard"
                            )
                        }
                    >
                        FreelanceHub
                    </div>

                    <div className="public-profile-user">

                        <span>
                            {user?.username}
                        </span>

                        <button
                            onClick={handleLogout}
                        >
                            Logout
                        </button>

                    </div>

                </header>

                <main className="public-profile-container">

                    <button
                        className="public-profile-back"
                        onClick={() =>
                            navigate(
                                "/find-freelancers"
                            )
                        }
                    >
                        ← Back to Freelancers
                    </button>

                    <div className="public-profile-error">

                        <h2>
                            Freelancer profile not found
                        </h2>

                        <p>
                            {error ||
                                "The requested freelancer profile could not be found."}
                        </p>

                        <button
                            onClick={() =>
                                navigate(
                                    "/find-freelancers"
                                )
                            }
                        >
                            Back to Freelancers
                        </button>

                    </div>

                </main>

            </div>
        );
    }

    // =========================================================
    // MAIN PROFILE
    // =========================================================

    return (
        <div className="public-profile-page">

            {/* =================================================
                NAVBAR
            ================================================= */}

            <header className="public-profile-navbar">

                <div
                    className="public-profile-logo"
                    onClick={() =>
                        navigate(
                            "/client/dashboard"
                        )
                    }
                >
                    FreelanceHub
                </div>

                <nav className="public-profile-nav">

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
                        onClick={() =>
                            navigate("/projects")
                        }
                    >
                        My Projects
                    </button>

                    <button
                        className="active"
                        onClick={() =>
                            navigate(
                                "/find-freelancers"
                            )
                        }
                    >
                        Find Freelancers
                    </button>

                </nav>

                <div className="public-profile-user">

                    <span>
                        {user?.username}
                    </span>

                    <button
                        onClick={handleLogout}
                    >
                        Logout
                    </button>

                </div>

            </header>

            {/* =================================================
                MAIN
            ================================================= */}

            <main className="public-profile-container">

                {/* BACK */}

                <button
                    className="public-profile-back"
                    onClick={() =>
                        navigate(
                            "/find-freelancers"
                        )
                    }
                >
                    ← Back to Freelancers
                </button>

                {/* =================================================
                    PROFILE HEADER
                ================================================= */}

                <section className="public-profile-header-card">

                    <div className="public-profile-avatar">

                        {freelancer.profile_picture ? (

                            <img
                                src={
                                    freelancer.profile_picture
                                }
                                alt={
                                    freelancer.username
                                }
                            />

                        ) : (

                            <span>
                                {freelancer.username
                                    ?.charAt(0)
                                    .toUpperCase()}
                            </span>

                        )}

                    </div>

                    <div className="public-profile-header-info">

                        <h1>
                            {freelancer.username}
                        </h1>

                        <p className="public-profile-headline">
                            {freelancer.headline ||
                                "Freelancer"}
                        </p>

                        <div className="public-profile-location">

                            <span>
                                📍{" "}
                                {freelancer.location ||
                                    "Location not specified"}
                            </span>

                            <span>
                                💼{" "}
                                {
                                    freelancer.experience_years
                                }{" "}
                                year
                                {freelancer.experience_years !==
                                1
                                    ? "s"
                                    : ""}{" "}
                                experience
                            </span>

                        </div>

                    </div>

                    <div className="public-profile-rate-box">

                        <span>
                            Hourly Rate
                        </span>

                        <strong>
                            {formatRate(
                                freelancer.hourly_rate
                            )}
                        </strong>

                    </div>

                </section>

                {/* =================================================
                    CONTENT
                ================================================= */}

                <div className="public-profile-grid">

                    {/* =================================================
                        LEFT
                    ================================================= */}

                    <div className="public-profile-main">

                        {/* ABOUT */}

                        <section className="public-profile-card">

                            <h2>
                                About
                            </h2>

                            <p className="public-profile-bio">

                                {freelancer.bio ||
                                    "This freelancer has not added a bio yet."}

                            </p>

                        </section>

                        {/* SKILLS */}

                        <section className="public-profile-card">

                            <h2>
                                Skills
                            </h2>

                            {freelancer.skills &&
                            freelancer.skills.length >
                                0 ? (

                                <div className="public-profile-skills">

                                    {freelancer.skills.map(
                                        (skill) => (

                                            <span
                                                key={
                                                    skill.id
                                                }
                                            >
                                                {
                                                    skill.name
                                                }
                                            </span>

                                        )
                                    )}

                                </div>

                            ) : (

                                <p className="public-profile-empty">
                                    No skills added yet.
                                </p>

                            )}

                        </section>

                    </div>

                    {/* =================================================
                        RIGHT SIDEBAR
                    ================================================= */}

                    <aside className="public-profile-sidebar">

                        {/* OVERVIEW */}

                        <section className="public-profile-card">

                            <h2>
                                Freelancer Overview
                            </h2>

                            <div className="public-profile-overview">

                                <div>

                                    <span>
                                        Experience
                                    </span>

                                    <strong>
                                        {
                                            freelancer.experience_years
                                        }{" "}
                                        year
                                        {freelancer.experience_years !==
                                        1
                                            ? "s"
                                            : ""}
                                    </strong>

                                </div>

                                <div>

                                    <span>
                                        Hourly Rate
                                    </span>

                                    <strong>
                                        {formatRate(
                                            freelancer.hourly_rate
                                        )}
                                    </strong>

                                </div>

                                <div>

                                    <span>
                                        Location
                                    </span>

                                    <strong>
                                        {freelancer.location ||
                                            "Not specified"}
                                    </strong>

                                </div>

                            </div>

                        </section>

                        {/* =================================================
                            INVITATION
                        ================================================= */}

                        <section className="public-profile-contact-card">

                            <h2>
                                Interested in working together?
                            </h2>

                            <p>
                                Invite this freelancer to
                                one of your open projects.
                            </p>

                            {/* OPEN BUTTON */}

                            {!showInviteForm && (

                                <button
                                    className="invite-button"
                                    onClick={
                                        handleOpenInvite
                                    }
                                >
                                    Invite to a Project
                                </button>

                            )}

                            {/* INVITATION FORM */}

                            {showInviteForm && (

                                <form
                                    className="invite-form"
                                    onSubmit={
                                        handleSendInvitation
                                    }
                                >

                                    {/* ERROR */}

                                    {inviteError && (

                                        <div className="invite-error">
                                            {inviteError}
                                        </div>

                                    )}

                                    {/* SUCCESS */}

                                    {inviteSuccess && (

                                        <div className="invite-success">
                                            {inviteSuccess}
                                        </div>

                                    )}

                                    {/* PROJECT */}

                                    <div className="invite-form-group">

                                        <label htmlFor="invite-project">
                                            Select Project
                                        </label>

                                        {projectsLoading ? (

                                            <select disabled>

                                                <option>
                                                    Loading projects...
                                                </option>

                                            </select>

                                        ) : (

                                            <select
                                                id="invite-project"
                                                value={
                                                    selectedProject
                                                }
                                                onChange={(
                                                    event
                                                ) =>
                                                    setSelectedProject(
                                                        event
                                                            .target
                                                            .value
                                                    )
                                                }
                                                disabled={
                                                    inviteLoading
                                                }
                                            >

                                                <option value="">
                                                    Select an open project
                                                </option>

                                                {projects.map(
                                                    (project) => (

                                                        <option
                                                            key={
                                                                project.id
                                                            }
                                                            value={
                                                                project.id
                                                            }
                                                        >
                                                            {
                                                                project.title
                                                            }
                                                        </option>

                                                    )
                                                )}

                                            </select>

                                        )}

                                    </div>

                                    {/* NO OPEN PROJECT */}

                                    {!projectsLoading &&
                                        projects.length ===
                                            0 && (

                                            <div className="invite-error">
                                                You don't have any
                                                open projects.
                                                Create a project
                                                first.
                                            </div>

                                        )}

                                    {/* MESSAGE */}

                                    <div className="invite-form-group">

                                        <label htmlFor="invite-message">
                                            Message
                                        </label>

                                        <textarea
                                            id="invite-message"
                                            value={
                                                inviteMessage
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setInviteMessage(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            placeholder="Introduce your project and explain why you would like to work with this freelancer..."
                                            rows="5"
                                            disabled={
                                                inviteLoading ||
                                                projects.length ===
                                                    0
                                            }
                                        />

                                    </div>

                                    {/* ACTIONS */}

                                    <div className="invite-form-actions">

                                        <button
                                            type="button"
                                            className="invite-cancel-button"
                                            onClick={
                                                handleCloseInvite
                                            }
                                            disabled={
                                                inviteLoading
                                            }
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="submit"
                                            className="invite-button"
                                            disabled={
                                                inviteLoading ||
                                                projectsLoading ||
                                                projects.length ===
                                                    0
                                            }
                                        >
                                            {inviteLoading
                                                ? "Sending..."
                                                : "Send Invitation"}
                                        </button>

                                    </div>

                                </form>

                            )}

                        </section>

                    </aside>

                </div>

            </main>

        </div>
    );
}

export default FreelancerPublicProfile;