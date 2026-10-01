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

    const [processingId, setProcessingId] =
        useState(null);


    /*
     * =====================================================
     * LOAD INVITATIONS
     * =====================================================
     */

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

            const invitationData =
                Array.isArray(response.data)
                    ? response.data
                    : [];


            /*
             * IMPORTANT:
             *
             * invitation.status = ACCEPTED
             * is NOT the same as
             * project.status = COMPLETED
             *
             * Therefore fetch the CURRENT project
             * status separately.
             */

            const invitationsWithProjectStatus =
                await Promise.all(

                    invitationData.map(
                        async (invitation) => {

                            try {

                                const projectResponse =
                                    await api.get(
                                        `/projects/${invitation.project}/`
                                    );

                                return {
                                    ...invitation,

                                    project_status:
                                        projectResponse.data.status,

                                    project_data:
                                        projectResponse.data,
                                };

                            } catch (projectError) {

                                console.error(
                                    `Unable to load project ${invitation.project}`,
                                    projectError
                                );

                                /*
                                 * Keep invitation even if
                                 * project request fails.
                                 */

                                return {
                                    ...invitation,

                                    project_status:
                                        invitation.project_status ||
                                        null,

                                    project_data:
                                        null,
                                };
                            }
                        }
                    )
                );


            setInvitations(
                invitationsWithProjectStatus
            );

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


    /*
     * =====================================================
     * INVITATION DECISION
     * =====================================================
     */

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


            /*
             * Update invitation status immediately.
             *
             * IMPORTANT:
             * This is ONLY invitation status.
             * Project status is handled separately.
             */

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

                        /*
                         * If backend returns project_status,
                         * use it.
                         *
                         * Otherwise after accepting,
                         * the project is normally IN_PROGRESS.
                         */

                        project_status:
                            response.data.project_status ||
                            invitation.project_status ||
                            (
                                decision === "ACCEPTED"
                                    ? "IN_PROGRESS"
                                    : invitation.project_status
                            ),
                    };

                })

            );


            /*
             * Reload from backend so the UI always
             * has the latest project status.
             */

            await fetchInvitations();

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


    /*
     * =====================================================
     * OPEN WORKSPACE
     * =====================================================
     */

    const handleOpenWorkspace = (
        projectId
    ) => {

        navigate(
            `/workspace/${projectId}`
        );
    };


    /*
     * =====================================================
     * DATE FORMAT
     * =====================================================
     */

    const formatDate = (date) => {

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


    /*
     * =====================================================
     * PROJECT STATUS
     * =====================================================
     */

    const getProjectStatus =
        (invitation) => {

            const status =
                invitation.project_status ||
                invitation.project_data?.status ||
                null;


            if (status === "COMPLETED") {

                return "COMPLETED";

            }


            if (status === "IN_PROGRESS") {

                return "IN PROGRESS";

            }


            if (status === "CANCELLED") {

                return "CANCELLED";

            }


            /*
             * If project status is not available,
             * fall back to invitation status.
             */

            if (
                invitation.status ===
                "ACCEPTED"
            ) {

                return "ACCEPTED";

            }


            if (
                invitation.status ===
                "REJECTED"
            ) {

                return "REJECTED";

            }


            return "PENDING";

        };


    /*
     * =====================================================
     * STATUS CLASS
     * =====================================================
     */

    const getStatusClass =
        (status) => {

            return status
                ?.toLowerCase()
                .replace(
                    /\s+/g,
                    "-"
                )
                .replace(
                    /_/g,
                    "-"
                );

        };


    /*
     * =====================================================
     * STATUS DISPLAY
     * =====================================================
     */

    const getStatusText =
        (invitation) => {

            return getProjectStatus(
                invitation
            );

        };


    /*
     * =====================================================
     * RENDER
     * =====================================================
     */

    return (

        <div className="invitations-page">


            {/* =================================================
                NAVBAR
            ================================================= */}

            <FreelancerNavbar />


            {/* =================================================
                MAIN
            ================================================= */}

            <main className="invitations-container">


                {/* =================================================
                    HEADER
                ================================================= */}

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
                        onClick={
                            fetchInvitations
                        }
                        disabled={loading}
                    >

                        {loading
                            ? "Refreshing..."
                            : "Refresh"
                        }

                    </button>

                </div>


                {/* =================================================
                    SUCCESS
                ================================================= */}

                {success && (

                    <div className="invitation-success">

                        {success}

                    </div>

                )}


                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (

                    <div className="invitation-error">

                        {error}

                    </div>

                )}


                {/* =================================================
                    SECTION
                ================================================= */}

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


                    {/* =================================================
                        LOADING
                    ================================================= */}

                    {loading ? (

                        <div className="invitation-empty">

                            <div className="invitation-spinner">
                            </div>


                            <p>

                                Loading invitations...

                            </p>

                        </div>


                    ) : invitations.length === 0 ? (


                        /* =================================================
                            EMPTY
                        ================================================= */

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


                        /* =================================================
                            INVITATION LIST
                        ================================================= */

                        <div className="invitation-list">

                            {invitations.map(
                                (invitation) => {


                                    const projectStatus =
                                        getProjectStatus(
                                            invitation
                                        );


                                    const statusClass =
                                        getStatusClass(
                                            projectStatus
                                        );


                                    const isCompleted =
                                        projectStatus ===
                                        "COMPLETED";


                                    const isCancelled =
                                        projectStatus ===
                                        "CANCELLED";


                                    const isAccepted =
                                        invitation.status ===
                                        "ACCEPTED";


                                    return (

                                        <article
                                            className="invitation-card"
                                            key={
                                                invitation.id
                                            }
                                        >


                                            {/* =================================================
                                                CARD HEADER
                                            ================================================= */}

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


                                                {/* =========================================
                                                    PROJECT STATUS
                                                ========================================= */}

                                                <span
                                                    className={
                                                        `invitation-status ${statusClass}`
                                                    }
                                                >

                                                    {
                                                        getStatusText(
                                                            invitation
                                                        )
                                                    }

                                                </span>

                                            </div>


                                            {/* =================================================
                                                DETAILS
                                            ================================================= */}

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

                                                        {
                                                            formatDate(
                                                                invitation.created_at
                                                            )
                                                        }

                                                    </strong>

                                                </div>

                                            </div>


                                            {/* =================================================
                                                MESSAGE
                                            ================================================= */}

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


                                            {/* =================================================
                                                PENDING ACTIONS
                                            ================================================= */}

                                            {invitation.status ===
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

                                                        {
                                                            processingId ===
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

                                                        {
                                                            processingId ===
                                                            invitation.id
                                                                ? "Processing..."
                                                                : "Accept Invitation"
                                                        }

                                                    </button>

                                                </div>

                                            )}


                                            {/* =================================================
                                                ACCEPTED + PROJECT STILL ACTIVE
                                            ================================================= */}

                                            {isAccepted &&
                                                !isCompleted &&
                                                !isCancelled && (

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


                                            {/* =================================================
                                                COMPLETED
                                            ================================================= */}

                                            {isCompleted && (

                                                <div className="completed-section">

                                                    <div className="completed-message">

                                                        <span>

                                                            ✓

                                                        </span>


                                                        <div>

                                                            <strong>

                                                                Project Completed

                                                            </strong>


                                                            <p>

                                                                This project
                                                                has been completed
                                                                successfully.

                                                            </p>

                                                        </div>

                                                    </div>


                                                    <button
                                                        className="workspace-button"
                                                        onClick={() =>
                                                            handleOpenWorkspace(
                                                                invitation.project
                                                            )
                                                        }
                                                    >

                                                        View Workspace

                                                        <span>

                                                            →

                                                        </span>

                                                    </button>

                                                </div>

                                            )}


                                            {/* =================================================
                                                CANCELLED
                                            ================================================= */}

                                            {isCancelled && (

                                                <div className="rejected-message">

                                                    <span>

                                                        ✕

                                                    </span>


                                                    <p>

                                                        This project
                                                        has been cancelled.

                                                    </p>

                                                </div>

                                            )}


                                            {/* =================================================
                                                REJECTED INVITATION
                                            ================================================= */}

                                            {invitation.status ===
                                                "REJECTED" &&
                                                !isCancelled && (

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