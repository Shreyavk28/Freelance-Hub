import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./ProjectDetail.css";
import FreelancerNavbar from "../components/FreelancerNavbar";

function ProjectDetail() {
    const { projectId } = useParams();
    const navigate = useNavigate();

    const { user, logout } = useAuth();

    const [project, setProject] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // =========================================================
    // FREELANCER PROPOSAL STATE
    // =========================================================

    const [submitting, setSubmitting] = useState(false);

    const [proposalError, setProposalError] = useState("");

    const [proposalSuccess, setProposalSuccess] =
        useState("");

    const [proposal, setProposal] = useState({
        cover_letter: "",
        proposed_budget: "",
        estimated_duration: "",
    });


    // =========================================================
    // CLIENT PROPOSAL STATE
    // =========================================================

    const [receivedProposals, setReceivedProposals] =
        useState([]);

    const [proposalsLoading, setProposalsLoading] =
        useState(false);

    const [proposalDecisionLoading, setProposalDecisionLoading] =
        useState(null);

    const [proposalDecisionError, setProposalDecisionError] =
        useState("");

    const [proposalDecisionSuccess, setProposalDecisionSuccess] =
        useState("");


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

            setProject(response.data);

        } catch (error) {
            console.error(
                "Project detail error:",
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
    // LOAD CLIENT RECEIVED PROPOSALS
    // =========================================================

    useEffect(() => {
        if (
            project &&
            project.client_username === user?.username
        ) {
            loadReceivedProposals();
        }
    }, [project, user]);


    const loadReceivedProposals = async () => {
        try {
            setProposalsLoading(true);

            setProposalDecisionError("");

            const response = await api.get(
                `/proposals/project/${projectId}/`
            );

            setReceivedProposals(response.data);

        } catch (error) {
            console.error(
                "Received proposals error:",
                error
            );

            setProposalDecisionError(
                error.response?.data?.detail ||
                    "Unable to load received proposals."
            );

        } finally {
            setProposalsLoading(false);
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
    // FREELANCER PROPOSAL FORM
    // =========================================================

    const handleProposalChange = (event) => {
        const { name, value } = event.target;

        setProposal((previous) => ({
            ...previous,
            [name]: value,
        }));
    };


    const handleSubmitProposal = async (event) => {
        event.preventDefault();

        setProposalError("");
        setProposalSuccess("");

        if (!proposal.cover_letter.trim()) {
            setProposalError(
                "Please enter a cover letter."
            );

            return;
        }

        if (
            !proposal.proposed_budget ||
            Number(proposal.proposed_budget) <= 0
        ) {
            setProposalError(
                "Please enter a valid proposed budget."
            );

            return;
        }

        if (
            !proposal.estimated_duration ||
            Number(proposal.estimated_duration) <= 0
        ) {
            setProposalError(
                "Please enter a valid estimated duration."
            );

            return;
        }

        try {
            setSubmitting(true);

            const response = await api.post(
                "/proposals/",
                {
                    project: Number(projectId),

                    cover_letter:
                        proposal.cover_letter.trim(),

                    proposed_budget:
                        Number(
                            proposal.proposed_budget
                        ),

                    estimated_duration:
                        Number(
                            proposal.estimated_duration
                        ),
                }
            );

            console.log(
                "Proposal submitted:",
                response.data
            );

            setProposalSuccess(
                "Your proposal has been submitted successfully."
            );

            setProposal({
                cover_letter: "",
                proposed_budget: "",
                estimated_duration: "",
            });

        } catch (error) {
            console.error(
                "Submit proposal error:",
                error
            );

            setProposalError(
                error.response?.data?.detail ||
                    "Unable to submit your proposal."
            );

        } finally {
            setSubmitting(false);
        }
    };


    // =========================================================
    // CLIENT ACCEPT / REJECT
    // =========================================================

    const handleProposalDecision = async (
        proposalId,
        status
    ) => {
        setProposalDecisionError("");
        setProposalDecisionSuccess("");

        const actionText =
            status === "ACCEPTED"
                ? "accept"
                : "reject";

        const confirmed = window.confirm(
            `Are you sure you want to ${actionText} this proposal?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setProposalDecisionLoading(proposalId);

            const response = await api.patch(
                `/proposals/${proposalId}/decision/`,
                {
                    status,
                }
            );

            console.log(
                "Proposal decision:",
                response.data
            );

            if (status === "ACCEPTED") {
                setProposalDecisionSuccess(
                    "Proposal accepted successfully. The project is now in progress."
                );
            } else {
                setProposalDecisionSuccess(
                    "Proposal rejected successfully."
                );
            }

            // Refresh project because accepting a proposal
            // changes the project status.
            await loadProject();

            // Refresh proposal list.
            await loadReceivedProposals();

        } catch (error) {
            console.error(
                "Proposal decision error:",
                error
            );

            setProposalDecisionError(
                error.response?.data?.detail ||
                    "Unable to update proposal."
            );

        } finally {
            setProposalDecisionLoading(null);
        }
    };


    // =========================================================
    // BACK
    // =========================================================

    const handleGoBack = () => {
        if (project && project.client_username === user?.username) {
            navigate("/projects");
            return;
        }

        if (user?.role === "FREELANCER") {
            navigate("/browse-projects");
        } else {
            navigate("/projects");
        }
    };

    // =========================================================
    // OPEN PROJECT WORKSPACE
    // =========================================================

    const handleOpenWorkspace = () => {
        navigate(`/workspace/${project.id}`);
    };


    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {
        return (
            <div className="project-detail-page">

                <header className="project-detail-navbar">

                    <div
                        className="project-detail-logo"
                        onClick={() =>
                            user?.role === "FREELANCER"
                                ? navigate(
                                      "/freelancer/dashboard"
                                  )
                                : navigate(
                                      "/client/dashboard"
                                  )
                        }
                    >
                        FreelanceHub
                    </div>

                    <div className="project-detail-user">

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

                <main className="project-detail-container">

                    <div className="project-detail-loading">
                        Loading project...
                    </div>

                </main>

            </div>
        );
    }


    // =========================================================
    // ERROR
    // =========================================================

    if (error || !project) {
        return (
            <div className="project-detail-page">

                <header className="project-detail-navbar">

                    <div
                        className="project-detail-logo"
                        onClick={() =>
                            user?.role === "FREELANCER"
                                ? navigate(
                                      "/freelancer/dashboard"
                                  )
                                : navigate(
                                      "/client/dashboard"
                                  )
                        }
                    >
                        FreelanceHub
                    </div>

                    <div className="project-detail-user">

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

                <main className="project-detail-container">

                    <div className="project-detail-error">

                        <h2>
                            Unable to load project
                        </h2>

                        <p>
                            {error ||
                                "Project not found."}
                        </p>

                        <button
                            className="back-button"
                            onClick={handleGoBack}
                        >
                            Go Back
                        </button>

                    </div>

                </main>

            </div>
        );
    }


    // =========================================================
    // USER / PROJECT CONDITIONS
    // =========================================================

    const isFreelancer =
        user?.role === "FREELANCER";

    const isClient =
        user?.role === "CLIENT";

   const isProjectOwner =
    project.client_username === user?.username;

    const canSubmitProposal =
        isFreelancer &&
        !isProjectOwner &&
        project.status === "OPEN";


    // =========================================================
    // RENDER
    // =========================================================

    return (
        <div className="project-detail-page">

            {/* =================================================
                NAVBAR
            ================================================= */}

            {isFreelancer ? (
                <FreelancerNavbar />
            ) : (
                <header className="project-detail-navbar">
                    <div
                        className="project-detail-logo"
                        onClick={() => navigate("/client/dashboard")}
                    >
                        FreelanceHub
                    </div>

                    <nav className="project-detail-nav">
                        <button
                            onClick={() => navigate("/client/dashboard")}
                        >
                            Dashboard
                        </button>

                        <button
                            className="active"
                            onClick={() => navigate("/projects")}
                        >
                            My Projects
                        </button>

                        <button
                            onClick={() => navigate("/find-freelancers")}
                        >
                            Find Freelancers
                        </button>
                    </nav>

                    <div className="project-detail-user">
                        <span>{user?.username}</span>
                        <button onClick={handleLogout}>Logout</button>
                    </div>
                </header>
            )}


            {/* =================================================
                MAIN
            ================================================= */}

            <main className="project-detail-container">

                <button
                    className="back-link"
                    onClick={handleGoBack}
                >
                    ← Back
                </button>


                <div className="project-detail-layout">

                    {/* =================================================
                        LEFT - PROJECT
                    ================================================= */}

                    <section className="project-detail-main">

                        <div className="project-detail-card">

                            <div className="project-detail-header">

                                <div>

                                    <div className="project-detail-label">
                                        PROJECT
                                    </div>

                                    <h1>
                                        {project.title}
                                    </h1>

                                    <p className="project-client">
                                        Posted by{" "}
                                        <strong>
                                            {
                                                project.client_username
                                            }
                                        </strong>
                                    </p>

                                </div>


                                <span
                                    className={`project-status project-status-${project.status.toLowerCase()}`}
                                >
                                    {project.status.replace(
                                        "_",
                                        " "
                                    )}
                                </span>

                            </div>


                            {/* =================================================
                                DESCRIPTION
                            ================================================= */}

                            <div className="project-description-section">

                                <h2>
                                    About the Project
                                </h2>

                                <p>
                                    {
                                        project.description
                                    }
                                </p>

                            </div>


                            {/* =================================================
                                PROJECT INFO
                            ================================================= */}

                            <div className="project-info-grid">

                                <div className="project-info-item">

                                    <span>
                                        Budget Type
                                    </span>

                                    <strong>
                                        {
                                            project.budget_type
                                        }
                                    </strong>

                                </div>


                                <div className="project-info-item">

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


                                <div className="project-info-item">

                                    <span>
                                        Priority
                                    </span>

                                    <strong>
                                        {
                                            project.priority
                                        }
                                    </strong>

                                </div>


                                <div className="project-info-item">

                                    <span>
                                        Deadline
                                    </span>

                                    <strong>
                                        {
                                            project.deadline
                                        }
                                    </strong>

                                </div>

                            </div>


                            {/* =================================================
                                SKILLS
                            ================================================= */}

                            <div className="project-skills-section">

                                <h2>
                                    Required Skills
                                </h2>

                                <div className="project-skills-list">

                                    {project.required_skill_names?.map(
                                        (skill) => (

                                            <span
                                                className="project-skill"
                                                key={skill}
                                            >
                                                {skill}
                                            </span>

                                        )
                                    )}

                                </div>

                            </div>


                            {/* =================================================
                                MATCH
                            ================================================= */}

                            {isFreelancer && !isProjectOwner && (

                                <div className="project-match-box">

                                    <div>

                                        <span>
                                            Your Skill Match
                                        </span>

                                        <strong>
                                            {
                                                project.skill_match_percentage
                                            }
                                            %
                                        </strong>

                                    </div>

                                    <p>
                                        This percentage shows
                                        how many of the
                                        project's required skills
                                        match your skills.
                                    </p>

                                </div>

                            )}

                        </div>


                        {/* =================================================
                            PROJECT OWNER RECEIVED PROPOSALS
                        ================================================= */}

                        {isProjectOwner && (

                            <div className="received-proposals-card">

                                <div className="received-proposals-header">

                                    <div>

                                        <div className="project-detail-label">
                                            FREELANCER RESPONSES
                                        </div>

                                        <h2>
                                            Received Proposals
                                        </h2>

                                        <p>
                                            Review proposals from
                                            freelancers and choose
                                            who you want to work with.
                                        </p>

                                    </div>

                                    <div className="proposal-count-badge">
                                        {receivedProposals.length}
                                    </div>

                                </div>


                                {/* =================================================
                                    SUCCESS
                                ================================================= */}

                                {proposalDecisionSuccess && (

                                    <div className="decision-success">

                                        {proposalDecisionSuccess}

                                    </div>

                                )}


                                {/* =================================================
                                    ERROR
                                ================================================= */}

                                {proposalDecisionError && (

                                    <div className="decision-error">

                                        {proposalDecisionError}

                                    </div>

                                )}


                                {/* =================================================
                                    LOADING
                                ================================================= */}

                                {proposalsLoading ? (

                                    <div className="received-proposals-loading">
                                        Loading proposals...
                                    </div>

                                ) : receivedProposals.length === 0 ? (

                                    <div className="no-proposals">

                                        <div className="no-proposals-icon">
                                            ?
                                        </div>

                                        <h3>
                                            No proposals yet
                                        </h3>

                                        <p>
                                            Freelancers have not
                                            submitted proposals
                                            for this project yet.
                                        </p>

                                    </div>

                                ) : (

                                    <div className="received-proposals-list">

                                        {receivedProposals.map(
                                            (proposal) => (

                                                <div
                                                    className="received-proposal-card"
                                                    key={proposal.id}
                                                >

                                                    {/* =================================================
                                                        PROPOSAL HEADER
                                                    ================================================= */}

                                                    <div className="received-proposal-top">

                                                        <div>

                                                            <div className="freelancer-name">
                                                                {proposal.freelancer_username}
                                                            </div>

                                                            <div className="proposal-submitted-date">
                                                                Submitted{" "}
                                                                {new Date(
                                                                    proposal.created_at
                                                                ).toLocaleDateString()}
                                                            </div>

                                                        </div>


                                                        <span
                                                            className={`proposal-status proposal-status-${proposal.status.toLowerCase()}`}
                                                        >
                                                            {
                                                                proposal.status
                                                            }
                                                        </span>

                                                    </div>


                                                    {/* =================================================
                                                        PROPOSAL DETAILS
                                                    ================================================= */}

                                                    <div className="received-proposal-details">

                                                        <div>

                                                            <span>
                                                                Proposed Budget
                                                            </span>

                                                            <strong>
                                                                ₹
                                                                {
                                                                    proposal.proposed_budget
                                                                }
                                                            </strong>

                                                        </div>

                                                        <div>

                                                            <span>
                                                                Estimated Duration
                                                            </span>

                                                            <strong>
                                                                {
                                                                    proposal.estimated_duration
                                                                }{" "}
                                                                days
                                                            </strong>

                                                        </div>

                                                    </div>


                                                    {/* =================================================
                                                        COVER LETTER
                                                    ================================================= */}

                                                    <div className="cover-letter-section">

                                                        <h4>
                                                            Cover Letter
                                                        </h4>

                                                        <p>
                                                            {
                                                                proposal.cover_letter
                                                            }
                                                        </p>

                                                    </div>


                                                    {/* =================================================
                                                        ACTIONS
                                                    ================================================= */}

                                                    {proposal.status ===
                                                        "PENDING" &&
                                                        project.status ===
                                                            "OPEN" && (

                                                        <div className="proposal-decision-actions">

                                                            <button
                                                                className="reject-proposal-button"
                                                                disabled={
                                                                    proposalDecisionLoading !==
                                                                    null
                                                                }
                                                                onClick={() =>
                                                                    handleProposalDecision(
                                                                        proposal.id,
                                                                        "REJECTED"
                                                                    )
                                                                }
                                                            >
                                                                {proposalDecisionLoading ===
                                                                    proposal.id
                                                                    ? "Processing..."
                                                                    : "Reject"}
                                                            </button>

                                                            <button
                                                                className="accept-proposal-button"
                                                                disabled={
                                                                    proposalDecisionLoading !==
                                                                    null
                                                                }
                                                                onClick={() =>
                                                                    handleProposalDecision(
                                                                        proposal.id,
                                                                        "ACCEPTED"
                                                                    )
                                                                }
                                                            >
                                                                {proposalDecisionLoading ===
                                                                    proposal.id
                                                                    ? "Processing..."
                                                                    : "Accept Proposal"}
                                                            </button>

                                                        </div>

                                                    )}

                                                </div>

                                            )
                                        )}

                                    </div>

                                )}

                            </div>

                        )}

                    </section>


                    {/* =================================================
                        RIGHT SIDEBAR
                    ================================================= */}

                    <aside className="project-detail-sidebar">

                        {/* =================================================
                            FREELANCER - SUBMIT PROPOSAL
                        ================================================= */}

                        {canSubmitProposal ? (

                            <div className="proposal-card">

                                <div className="proposal-card-header">

                                    <h2>
                                        Submit a Proposal
                                    </h2>

                                    <p>
                                        Tell the project owner why you're
                                        a good fit for this project.
                                    </p>

                                </div>


                                {proposalSuccess && (

                                    <div className="proposal-success">

                                        {proposalSuccess}

                                        <button
                                            type="button"
                                            onClick={() =>
                                                navigate(
                                                    "/proposals"
                                                )
                                            }
                                        >
                                            View My Proposals
                                        </button>

                                    </div>

                                )}


                                {proposalError && (

                                    <div className="proposal-error">
                                        {proposalError}
                                    </div>

                                )}


                                <form
                                    onSubmit={
                                        handleSubmitProposal
                                    }
                                    className="proposal-form"
                                >

                                    <div className="proposal-form-group">

                                        <label htmlFor="cover_letter">
                                            Cover Letter
                                        </label>

                                        <textarea
                                            id="cover_letter"
                                            name="cover_letter"
                                            value={
                                                proposal.cover_letter
                                            }
                                            onChange={
                                                handleProposalChange
                                            }
                                            rows="7"
                                            placeholder="Introduce yourself and explain how you can complete this project..."
                                            required
                                        />

                                    </div>


                                    <div className="proposal-form-group">

                                        <label htmlFor="proposed_budget">
                                            Your Proposed Budget
                                        </label>

                                        <div className="proposal-input-with-symbol">

                                            <span>
                                                ₹
                                            </span>

                                            <input
                                                id="proposed_budget"
                                                name="proposed_budget"
                                                type="number"
                                                min="1"
                                                step="0.01"
                                                value={
                                                    proposal.proposed_budget
                                                }
                                                onChange={
                                                    handleProposalChange
                                                }
                                                placeholder="Enter amount"
                                                required
                                            />

                                        </div>

                                    </div>


                                    <div className="proposal-form-group">

                                        <label htmlFor="estimated_duration">
                                            Estimated Duration
                                        </label>

                                        <div className="proposal-input-with-suffix">

                                            <input
                                                id="estimated_duration"
                                                name="estimated_duration"
                                                type="number"
                                                min="1"
                                                value={
                                                    proposal.estimated_duration
                                                }
                                                onChange={
                                                    handleProposalChange
                                                }
                                                placeholder="e.g. 30"
                                                required
                                            />

                                            <span>
                                                days
                                            </span>

                                        </div>

                                    </div>


                                    <button
                                        type="submit"
                                        className="submit-proposal-button"
                                        disabled={submitting}
                                    >
                                        {submitting
                                            ? "Submitting..."
                                            : "Submit Proposal"}
                                    </button>

                                </form>

                            </div>

                        ) : project.status !==
                              "OPEN" &&
                          isFreelancer ? (

                            <div className="proposal-closed-card">

                                <div className="closed-icon">
                                    ✓
                                </div>

                                <h2>
                                    Project Not Open
                                </h2>

                                <p>
                                    This project is currently{" "}
                                    <strong>
                                        {project.status.replace(
                                            "_",
                                            " "
                                        )}
                                    </strong>
                                    .
                                </p>

                                <button
                                    onClick={() =>
                                        navigate(
                                            "/browse-projects"
                                        )
                                    }
                                >
                                    Browse Other Projects
                                </button>

                            </div>

                        ) : isProjectOwner ? (

                            <div className="project-owner-card">

                                <h2>
                                    Your Project
                                </h2>

                                <p>
                                    Manage your project, review freelancer
                                    proposals and work with the selected
                                    freelancer.
                                </p>

                                {(project.status === "IN_PROGRESS" ||
  project.status === "COMPLETED") && (
    <button
        className="workspace-button"
        onClick={handleOpenWorkspace}
    >
        Open Workspace →
    </button>
)}

                                {project.status ===
                                    "OPEN" && (

                                    <button
                                        onClick={() =>
                                            navigate(
                                                `/projects/${project.id}/edit`
                                            )
                                        }
                                    >
                                        Edit Project
                                    </button>

                                )}

                            </div>

                        ) : null}

                    </aside>

                </div>

            </main>

        </div>
    );
}

export default ProjectDetail;