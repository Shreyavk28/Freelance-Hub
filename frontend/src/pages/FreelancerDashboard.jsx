import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";
import FreelancerNavbar from "../components/FreelancerNavbar";

import "./FreelancerInvitations.css";


function FreelancerInvitations() {

    const navigate = useNavigate();

    const [invitations, setInvitations] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [processingId, setProcessingId] = useState(null);


    // =================================================
    // FETCH INVITATIONS
    // =================================================

    useEffect(() => {

        fetchInvitations();

    }, []);


    const fetchInvitations = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await api.get(
                "/collaborations/freelancer/"
            );

            setInvitations(response.data);

        } catch (error) {

            console.error(
                "Error loading invitations:",
                error
            );

            setError(
                error.response?.data?.detail ||
                "Unable to load invitations."
            );

        } finally {

            setLoading(false);

        }
    };


    // =================================================
    // INVITATION DECISION
    // =================================================

    const handleDecision = async (
        invitationId,
        decision
    ) => {

        try {

            setProcessingId(invitationId);

            setError("");
            setSuccess("");

            const response = await api.patch(
                `/collaborations/${invitationId}/decision/`,
                {
                    status: decision,
                }
            );


            if (decision === "ACCEPTED") {

                setSuccess(
                    "Invitation accepted successfully."
                );

            } else {

                setSuccess(
                    "Invitation rejected successfully."
                );

            }


            // -----------------------------------------
            // UPDATE INVITATION IMMEDIATELY
            // -----------------------------------------

            setInvitations((current) =>
                current.map((invitation) => {

                    if (
                        invitation.id !==
                        invitationId
                    ) {
                        return invitation;
                    }


                    return {
                        ...invitation,

                        status:
                            response.data.status ||
                            decision,

                        display_status:
                            response.data.display_status ||
                            decision,

                        project_status:
                            response.data.project_status ||
                            invitation.project_status,
                    };

                })
            );


        } catch (error) {

            console.error(
                "Invitation decision error:",
                error
            );

            setError(
                error.response?.data?.detail ||
                "Unable to process invitation."
            );

        } finally {

            setProcessingId(null);

        }

    };


    // =================================================
    // OPEN WORKSPACE
    // =================================================

    const handleOpenWorkspace = (
        projectId
    ) => {

        navigate(
            `/workspace/${projectId}`
        );

    };


    // =================================================
    // FORMAT DATE
    // =================================================

    const formatDate = (date) => {

        if (!date) {

            return "Not available";

        }


        return new Date(date).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );

    };


    // =================================================
    // STATUS
    // =================================================

    const getDisplayStatus = (invitation) => {

        /*
         * display_status comes from the backend.
         *
         * Fallback to invitation.status so that
         * the page still works with older API data.
         */

        return (
            invitation.display_status ||
            invitation.status
        );

    };


    const getStatusClass = (status) => {

        return status
            ?.toLowerCase()
            .replace(/_/g, "-");

    };


    // =================================================
    // RENDER
    // =================================================

    return (

        <div className="invitations-page">

            {/* =========================================
                NAVBAR
            ========================================== */}

            <FreelancerNavbar />


            {/* =========================================
                MAIN
            ========================================== */}

            <main className="invitations-container">


                {/* =====================================
                    HEADER
                ====================================== */}

                <div className="invitations-header">

                    <div>

                        <p className="invitations-eyebrow">
                            FREELANCER WORKSPACE
                        </p>


                        <h1>
                            Project Invitations
                        </h1>


                        <p>
                            Review invitations from clients
                            and decide which projects you
                            want to work on.
                        </p>

                    </div>


                    <button
                        className="refresh-button"
                        onClick={fetchInvitations}
                        disabled={loading}
                    >

                        {loading
                            ? "Refreshing..."
                            : "Refresh"
                        }

                    </button>

                </div>


                {/* =====================================
                    SUCCESS
                ====================================== */}

                {success && (

                    <div className="invitation-success">

                        {success}

                    </div>

                )}


                {/* =====================================
                    ERROR
                ====================================== */}

                {error && (

                    <div className="invitation-error">

                        {error}

                    </div>

                )}


                {/* =====================================
                    SECTION
                ====================================== */}

                <section className="invitation-section">


                    <div className="section-heading">

                        <h2>
                            Received Invitations
                        </h2>


                        <p>
                            Invitations sent by clients
                            for their projects.
                        </p>

                    </div>


                    {/* =================================
                        LOADING
                    ================================== */}

                    {loading ? (

                        <div className="invitation-empty">

                            <div className="invitation-spinner"></div>

                            <p>
                                Loading invitations...
                            </p>

                        </div>


                    ) : invitations.length === 0 ? (

                        /* =================================
                            EMPTY
                        ================================== */

                        <div className="invitation-empty">

                            <div className="empty-invitation-icon">
                                ✉
                            </div>


                            <h3>
                                No invitations yet
                            </h3>


                            <p>
                                When a client invites you
                                to work on a project,
                                the invitation will appear
                                here.
                            </p>

                        </div>


                    ) : (

                        /* =================================
                            INVITATIONS
                        ================================== */

                        <div className="invitation-list">

                            {invitations.map(
                                (invitation) => {

                                    const displayStatus =
                                        getDisplayStatus(
                                            invitation
                                        );


                                    return (

                                        <article
                                            className="invitation-card"
                                            key={invitation.id}
                                        >


                                            {/* ==================
                                                CARD HEADER
                                            =================== */}

                                            <div className="invitation-card-header">

                                                <div>

                                                    <span className="invitation-label">
                                                        PROJECT INVITATION
                                                    </span>


                                                    <h3>
                                                        {
                                                            invitation.project_title
                                                        }
                                                    </h3>

                                                </div>


                                                {/* =================================
                                                    STATUS BADGE
                                                ================================== */}

                                                <span
                                                    className={`invitation-status ${getStatusClass(
                                                        displayStatus
                                                    )}`}
                                                >

                                                    {displayStatus}

                                                </span>

                                            </div>


                                            {/* ==================
                                                DETAILS
                                            =================== */}

                                            <div className="invitation-details">


                                                <div>

                                                    <span>
                                                        Invited by
                                                    </span>


                                                    <strong>
                                                        {
                                                            invitation.client_username
                                                        }
                                                    </strong>

                                                </div>


                                                <div>

                                                    <span>
                                                        Received
                                                    </span>


                                                    <strong>
                                                        {formatDate(
                                                            invitation.created_at
                                                        )}
                                                    </strong>

                                                </div>

                                            </div>


                                            {/* ==================
                                                MESSAGE
                                            =================== */}

                                            {invitation.message && (

                                                <div className="invitation-message">

                                                    <h4>
                                                        Message from client
                                                    </h4>


                                                    <p>
                                                        {
                                                            invitation.message
                                                        }
                                                    </p>

                                                </div>

                                            )}


                                            {/* ==================
                                                PENDING
                                            =================== */}

                                            {displayStatus ===
                                                "PENDING" && (

                                                <div className="invitation-actions">


                                                    <button
                                                        className="reject-button"
                                                        disabled={
                                                            processingId ===
                                                            invitation.id
                                                        }
                                                        onClick={() =>
                                                            handleDecision(
                                                                invitation.id,
                                                                "REJECTED"
                                                            )
                                                        }
                                                    >

                                                        {processingId ===
                                                        invitation.id
                                                            ? "Processing..."
                                                            : "Reject"
                                                        }

                                                    </button>


                                                    <button
                                                        className="accept-button"
                                                        disabled={
                                                            processingId ===
                                                            invitation.id
                                                        }
                                                        onClick={() =>
                                                            handleDecision(
                                                                invitation.id,
                                                                "ACCEPTED"
                                                            )
                                                        }
                                                    >

                                                        {processingId ===
                                                        invitation.id
                                                            ? "Processing..."
                                                            : "Accept Invitation"
                                                        }

                                                    </button>

                                                </div>

                                            )}


                                            {/* ==================
                                                ACCEPTED
                                            =================== */}

                                            {displayStatus ===
                                                "ACCEPTED" && (

                                                <div className="accepted-section">


                                                    <div className="accepted-message">

                                                        <span>
                                                            ✓
                                                        </span>


                                                        <p>
                                                            You accepted
                                                            this project
                                                            invitation.
                                                        </p>

                                                    </div>


                                                    <button
                                                        className="workspace-button"
                                                        onClick={() =>
                                                            handleOpenWorkspace(
                                                                invitation.project
                                                            )
                                                        }
                                                    >

                                                        Open Workspace

                                                        <span>
                                                            →
                                                        </span>

                                                    </button>

                                                </div>

                                            )}


                                            {/* ==================
                                                COMPLETED
                                            =================== */}

                                            {displayStatus ===
                                                "COMPLETED" && (

                                                <div className="accepted-section">


                                                    <div className="accepted-message">

                                                        <span>
                                                            ✓
                                                        </span>


                                                        <p>
                                                            This project
                                                            has been
                                                            completed.
                                                        </p>

                                                    </div>


                                                    <button
                                                        className="workspace-button"
                                                        onClick={() =>
                                                            handleOpenWorkspace(
                                                                invitation.project
                                                            )
                                                        }
                                                    >

                                                        Open Workspace

                                                        <span>
                                                            →
                                                        </span>

                                                    </button>

                                                </div>

                                            )}


                                            {/* ==================
                                                CANCELLED
                                            =================== */}

                                            {displayStatus ===
                                                "CANCELLED" && (

                                                <div className="rejected-message">

                                                    <span>
                                                        ✕
                                                    </span>


                                                    <p>
                                                        This project
                                                        has been
                                                        cancelled.
                                                    </p>

                                                </div>

                                            )}


                                            {/* ==================
                                                REJECTED
                                            =================== */}

                                            {displayStatus ===
                                                "REJECTED" && (

                                                <div className="rejected-message">

                                                    <span>
                                                        ✕
                                                    </span>


                                                    <p>
                                                        You rejected
                                                        this project
                                                        invitation.
                                                    </p>

                                                </div>

                                            )}

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


export default FreelancerInvitations;