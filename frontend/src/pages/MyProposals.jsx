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

    const getStatusClass = (status) => {
        return `proposal-status proposal-status-${status.toLowerCase()}`;
    };

    const formatStatus = (status) => {
        return status
            .replace("_", " ")
            .toLowerCase()
            .replace(/\b\w/g, (letter) =>
                letter.toUpperCase()
            );
    };

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

                {/* Header */}

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


                {/* Error */}

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

                        <div className="summary-card">

                            <span>
                                Total Proposals
                            </span>

                            <strong>
                                {proposals.length}
                            </strong>

                        </div>


                        <div className="summary-card">

                            <span>
                                Pending
                            </span>

                            <strong>
                                {
                                    proposals.filter(
                                        (proposal) =>
                                            proposal.status ===
                                            "PENDING"
                                    ).length
                                }
                            </strong>

                        </div>


                        <div className="summary-card">

                            <span>
                                Accepted
                            </span>

                            <strong>
                                {
                                    proposals.filter(
                                        (proposal) =>
                                            proposal.status ===
                                            "ACCEPTED"
                                    ).length
                                }
                            </strong>

                        </div>


                        <div className="summary-card">

                            <span>
                                Rejected
                            </span>

                            <strong>
                                {
                                    proposals.filter(
                                        (proposal) =>
                                            proposal.status ===
                                            "REJECTED"
                                    ).length
                                }
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

                        <div className="proposal-list">

                            {proposals.map(
                                (proposal) => (

                                    <article
                                        className="proposal-card"
                                        key={proposal.id}
                                    >

                                        {/* Top */}

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


                                            <span
                                                className={getStatusClass(
                                                    proposal.status
                                                )}
                                            >
                                                {formatStatus(
                                                    proposal.status
                                                )}
                                            </span>

                                        </div>


                                        {/* Details */}

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


                                        {/* Cover Letter */}

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


                                        {/* Actions */}

                                        <div className="proposal-actions">

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

                                )
                            )}

                        </div>

                    )}

                </section>

            </main>

        </div>
    );
}

export default MyProposals;