import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import FreelancerNavbar from "../components/FreelancerNavbar";
import api from "../services/api";
import "./MyProposals.css";

function MyProposals() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [proposals, setProposals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadProposals();
    }, []);

    const loadProposals = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                "/proposals/my/"
            );

            setProposals(response.data);

        } catch (error) {
            console.error(
                "My proposals error:",
                error
            );

            setError(
                error.response?.data?.detail ||
                "Unable to load your proposals."
            );

        } finally {
            setLoading(false);
        }
    };

    /*
     * --------------------------------------------------
     * DISPLAY STATUS
     * --------------------------------------------------
     *
     * The proposal itself can remain ACCEPTED even
     * after the project is completed.
     *
     * Backend now provides:
     *
     * display_status = COMPLETED
     *
     * when the project is completed.
     *
     * So the UI should use display_status first.
     */

    const getDisplayStatus = (proposal) => {
        if (proposal.display_status) {
            return proposal.display_status;
        }

        /*
         * Fallback for older backend responses.
         *
         * If there is no display_status but the project
         * is completed, show COMPLETED.
         */

        if (
            proposal.project_status ===
            "COMPLETED"
        ) {
            return "COMPLETED";
        }

        /*
         * If the project is cancelled, show CANCELLED.
         */

        if (
            proposal.project_status ===
            "CANCELLED"
        ) {
            return "CANCELLED";
        }

        /*
         * Otherwise use the actual proposal status.
         */

        return proposal.status;
    };

    const getStatusClass = (status) => {
        return `proposal-status proposal-status-${String(
            status || ""
        ).toLowerCase()}`;
    };

    const formatStatus = (status) => {
        if (!status) {
            return "";
        }

        return status
            .replace(/_/g, " ")
            .toLowerCase()
            .replace(/\b\w/g, (letter) =>
                letter.toUpperCase()
            );
    };

    /*
     * --------------------------------------------------
     * SUMMARY COUNTS
     * --------------------------------------------------
     */

    const pendingCount = proposals.filter(
        (proposal) =>
            getDisplayStatus(proposal) ===
            "PENDING"
    ).length;

    const acceptedCount = proposals.filter(
        (proposal) =>
            getDisplayStatus(proposal) ===
            "ACCEPTED"
    ).length;

    const rejectedCount = proposals.filter(
        (proposal) =>
            getDisplayStatus(proposal) ===
            "REJECTED"
    ).length;

    return (
        <div className="proposals-page">

            {/* =========================================
                NAVBAR
            ========================================= */}

            <FreelancerNavbar />

            {/* =========================================
                MAIN
            ========================================= */}

            <main className="proposals-container">

                {/* =========================================
                    HEADER
                ========================================= */}

                <section className="proposals-header">

                    <div>

                        <p className="proposals-label">
                            FREELANCER WORK
                        </p>

                        <h1>
                            My Proposals
                        </h1>

                        <p>
                            Track the proposals you have
                            submitted to clients.
                        </p>

                    </div>

                    <button
                        className="browse-projects-button"
                        onClick={() =>
                            navigate(
                                "/browse-projects"
                            )
                        }
                    >
                        Browse Projects
                    </button>

                </section>

                {/* =========================================
                    ERROR
                ========================================= */}

                {error && (
                    <div className="proposals-error">
                        {error}
                    </div>
                )}

                {/* =========================================
                    SUMMARY
                ========================================= */}

                {!loading && !error && (

                    <section className="proposal-summary">

                        {/* TOTAL */}

                        <div className="summary-card">

                            <span>
                                Total Proposals
                            </span>

                            <strong>
                                {proposals.length}
                            </strong>

                        </div>

                        {/* PENDING */}

                        <div className="summary-card">

                            <span>
                                Pending
                            </span>

                            <strong>
                                {pendingCount}
                            </strong>

                        </div>

                        {/* ACCEPTED */}

                        <div className="summary-card">

                            <span>
                                Accepted
                            </span>

                            <strong>
                                {acceptedCount}
                            </strong>

                        </div>

                        {/* REJECTED */}

                        <div className="summary-card">

                            <span>
                                Rejected
                            </span>

                            <strong>
                                {rejectedCount}
                            </strong>

                        </div>

                    </section>

                )}

                {/* =========================================
                    PROPOSALS
                ========================================= */}

                <section className="proposals-section">

                    <div className="section-title">

                        <div>

                            <h2>
                                Submitted Proposals
                            </h2>

                            <p>
                                Your proposal history.
                            </p>

                        </div>

                    </div>

                    {/* =====================================
                        LOADING
                    ===================================== */}

                    {loading ? (

                        <div className="proposals-empty">

                            <div className="empty-icon">
                                ⏳
                            </div>

                            <h3>
                                Loading proposals...
                            </h3>

                            <p>
                                Please wait.
                            </p>

                        </div>

                    ) : proposals.length === 0 ? (

                        /* =================================
                           EMPTY
                        ================================= */

                        <div className="proposals-empty">

                            <div className="empty-icon">
                                📄
                            </div>

                            <h3>
                                No proposals yet
                            </h3>

                            <p>
                                Browse available projects
                                and submit your first
                                proposal.
                            </p>

                            <button
                                className="browse-projects-button"
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

                        /* =================================
                           PROPOSAL LIST
                        ================================= */

                        <div className="proposal-list">

                            {proposals.map(
                                (proposal) => {

                                    const displayStatus =
                                        getDisplayStatus(
                                            proposal
                                        );

                                    return (
                                        <article
                                            className="proposal-card"
                                            key={
                                                proposal.id
                                            }
                                        >

                                            {/* =================================
                                                TOP
                                            ================================= */}

                                            <div className="proposal-card-top">

                                                <div>

                                                    <h3>
                                                        {
                                                            proposal.project_title
                                                        }
                                                    </h3>

                                                    <p className="proposal-date">
                                                        Submitted{" "}
                                                        {new Date(
                                                            proposal.created_at
                                                        ).toLocaleDateString()}
                                                    </p>

                                                </div>

                                                {/* STATUS */}

                                                <span
                                                    className={getStatusClass(
                                                        displayStatus
                                                    )}
                                                >
                                                    {formatStatus(
                                                        displayStatus
                                                    )}
                                                </span>

                                            </div>

                                            {/* =================================
                                                DETAILS
                                            ================================= */}

                                            <div className="proposal-details">

                                                <div className="proposal-detail">

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

                                                <div className="proposal-detail">

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

                                                <div className="proposal-detail">

                                                    <span>
                                                        Project
                                                    </span>

                                                    <strong>
                                                        #
                                                        {
                                                            proposal.project
                                                        }
                                                    </strong>

                                                </div>

                                            </div>

                                            {/* =================================
                                                COVER LETTER
                                            ================================= */}

                                            <div className="cover-letter">

                                                <span>
                                                    Cover Letter
                                                </span>

                                                <p>
                                                    {
                                                        proposal.cover_letter
                                                    }
                                                </p>

                                            </div>

                                            {/* =================================
                                                ACTIONS
                                            ================================= */}

                                            <div className="proposal-actions">

                                                {/* =================================
                                                    OPEN WORKSPACE
                                                ================================= */}

                                                {(
                                                    displayStatus ===
                                                        "ACCEPTED" ||
                                                    displayStatus ===
                                                        "COMPLETED"
                                                ) && (

                                                    <button
                                                        className="view-project-button"
                                                        onClick={() =>
                                                            navigate(
                                                                `/workspace/${proposal.project}`
                                                            )
                                                        }
                                                    >
                                                        Open Workspace →
                                                    </button>

                                                )}

                                                {/* =================================
                                                    VIEW PROJECT
                                                ================================= */}

                                                <button
                                                    className="view-project-button"
                                                    onClick={() =>
                                                        navigate(
                                                            `/projects/${proposal.project}`
                                                        )
                                                    }
                                                >
                                                    View Project
                                                </button>

                                            </div>

                                        </article>
                                    );
                                }
                            )}

                        </div>

                    )}

                </section>

            </main>

        </div>
    );
}

export default MyProposals;