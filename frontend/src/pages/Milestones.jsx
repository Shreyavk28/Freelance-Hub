import { useEffect, useState } from "react";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

import "./Milestones.css";


function getStoredUser() {
    try {
        return JSON.parse(
            localStorage.getItem("user")
        );
    } catch {
        return null;
    }
}


export default function Milestones({
    projectId,
    projectStatus,
    onProjectStatusChange,
}) {

    // =====================================================
    // USER
    // =====================================================

    const {
        user: authUser
    } = useAuth();

    const storedUser =
        getStoredUser();

    const user =
        authUser || storedUser;

    const isClient =
        user?.role === "CLIENT";

    const isFreelancer =
        user?.role === "FREELANCER";


    // =====================================================
    // STATE
    // =====================================================

    const [
        milestones,
        setMilestones
    ] = useState([]);

    const [
        loading,
        setLoading
    ] = useState(true);

    const [
        error,
        setError
    ] = useState("");

    const [
        message,
        setMessage
    ] = useState("");

    const [
        showCreateForm,
        setShowCreateForm
    ] = useState(false);

    const [
        creating,
        setCreating
    ] = useState(false);

    const [
        savingId,
        setSavingId
    ] = useState(null);

    const [
        deletingId,
        setDeletingId
    ] = useState(null);

    const [
        reviewingId,
        setReviewingId
    ] = useState(null);

    /*
     * Slider values are kept locally until
     * the freelancer clicks Save Progress.
     */

    const [
        draftProgress,
        setDraftProgress
    ] = useState({});


    // =====================================================
    // CREATE FORM
    // =====================================================

    const [
        form,
        setForm
    ] = useState({
        title: "",
        amount: "",
        due_date: "",
        description: "",
    });


    // =====================================================
    // LOAD MILESTONES
    // =====================================================

    const loadMilestones = async () => {

        if (!projectId) {
            return;
        }

        try {

            setLoading(true);
            setError("");

            /*
             * Keep your existing working endpoint.
             */

            const response =
                await api.get(
                    `/projects/${projectId}/milestones/`
                );

            const data =
                Array.isArray(response.data)
                    ? response.data
                    : [];

            setMilestones(data);

            /*
             * Initialize local slider values.
             */

            const progressMap = {};

            data.forEach((milestone) => {

                progressMap[milestone.id] =
                    Number(
                        milestone.progress || 0
                    );

            });

            setDraftProgress(
                progressMap
            );

        } catch (err) {

            console.error(
                "Milestones error:",
                err
            );

            setError(
                err.response?.data?.detail ||
                "Unable to load milestones."
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {

        loadMilestones();

    }, [projectId]);


    // =====================================================
    // FORM CHANGE
    // =====================================================

    const handleChange = (
        event
    ) => {

        const {
            name,
            value
        } = event.target;

        setForm(
            previous => ({
                ...previous,
                [name]: value,
            })
        );
    };


    // =====================================================
    // RESET FORM
    // =====================================================

    const resetForm = () => {

        setForm({
            title: "",
            amount: "",
            due_date: "",
            description: "",
        });

        setShowCreateForm(false);
    };


    // =====================================================
    // CREATE MILESTONE
    // CLIENT ONLY
    // =====================================================

    const handleCreate = async (
        event
    ) => {

        event.preventDefault();

        if (!isClient) {

            setError(
                "Only the project client can create milestones."
            );

            return;
        }

        if (
            projectStatus !==
            "IN_PROGRESS"
        ) {

            setError(
                "Milestones can only be created when the project is in progress."
            );

            return;
        }

        if (!form.title.trim()) {

            setError(
                "Please enter a milestone title."
            );

            return;
        }

        if (!form.amount) {

            setError(
                "Please enter the milestone amount."
            );

            return;
        }

        if (
            Number(form.amount) <= 0
        ) {

            setError(
                "Amount must be greater than zero."
            );

            return;
        }

        if (!form.due_date) {

            setError(
                "Please select a due date."
            );

            return;
        }

        try {

            setCreating(true);
            setError("");
            setMessage("");

            await api.post(
                `/projects/${projectId}/milestones/`,
                {
                    title:
                        form.title.trim(),

                    amount:
                        Number(form.amount),

                    due_date:
                        form.due_date,

                    description:
                        form.description.trim(),
                }
            );

            setMessage(
                "Milestone created successfully."
            );

            resetForm();

            await loadMilestones();

        } catch (err) {

            console.error(
                "Create milestone error:",
                err
            );

            setError(
                err.response?.data?.detail ||
                "Unable to create milestone."
            );

        } finally {

            setCreating(false);

        }
    };


    // =====================================================
    // SLIDER CHANGE
    // FREELANCER ONLY
    // =====================================================

    const handleProgressSlider = (
        milestoneId,
        event
    ) => {

        const value =
            Number(
                event.target.value
            );

        setDraftProgress(
            previous => ({
                ...previous,
                [milestoneId]: value,
            })
        );
    };


    // =====================================================
    // SAVE PROGRESS
    // FREELANCER ONLY
    // =====================================================

    const handleSaveProgress = async (
        milestone
    ) => {

        if (!isFreelancer) {

            setError(
                "Only the assigned freelancer can update progress."
            );

            return;
        }

        const newProgress =
            Number(
                draftProgress[milestone.id] ??
                milestone.progress ??
                0
            );

        try {

            setSavingId(
                milestone.id
            );

            setError("");
            setMessage("");

            /*
             * IMPORTANT:
             *
             * This is the corrected URL.
             */

            const response =
                await api.patch(
                    `/milestones/${milestone.id}/progress/`,
                    {
                        progress:
                            newProgress,
                    }
                );

            setMilestones(
                previous =>
                    previous.map(
                        item =>
                            item.id ===
                            milestone.id
                                ? response.data
                                : item
                    )
            );

            setDraftProgress(
                previous => ({
                    ...previous,
                    [milestone.id]:
                        Number(
                            response.data.progress || 0
                        ),
                })
            );

            if (
                newProgress === 100
            ) {

                setMessage(
                    "Milestone submitted for client review."
                );

            } else {

                setMessage(
                    "Progress updated successfully."
                );

            }

        } catch (err) {

            console.error(
                "Progress update error:",
                err
            );

            setError(
                err.response?.data?.detail ||
                err.response?.data?.progress ||
                "Unable to update milestone progress."
            );

        } finally {

            setSavingId(null);

        }
    };


    // =====================================================
    // CLIENT REVIEW
    // =====================================================

    const handleReview = async (
        milestone,
        action
    ) => {

        if (!isClient) {

            setError(
                "Only the project client can review milestones."
            );

            return;
        }

        let confirmationMessage =
            "";

        if (
            action === "approve"
        ) {

            confirmationMessage =
                "Approve this milestone as completed?";

        } else if (
            action === "changes"
        ) {

            confirmationMessage =
                "Request changes from the freelancer?";

        } else if (
            action === "cancel"
        ) {

            confirmationMessage =
                "Cancel this milestone?";

        }

        const confirmed =
            window.confirm(
                confirmationMessage
            );

        if (!confirmed) {
            return;
        }

        try {

            setReviewingId(
                milestone.id
            );

            setError("");
            setMessage("");

            /*
             * Correct review URL.
             */

            const response =
                await api.patch(
                    `/milestones/${milestone.id}/review/`,
                    {
                        action,
                    }
                );

            const updatedMilestone =
                response.data?.milestone;

            if (
                updatedMilestone
            ) {

                setMilestones(
                    previous =>
                        previous.map(
                            item =>
                                item.id ===
                                milestone.id
                                    ? updatedMilestone
                                    : item
                        )
                );

                setDraftProgress(
                    previous => ({
                        ...previous,
                        [milestone.id]:
                            Number(
                                updatedMilestone.progress || 0
                            ),
                    })
                );
            }

            if (
                response.data?.project_status &&
                onProjectStatusChange
            ) {

                onProjectStatusChange(
                    response.data.project_status
                );
            }

            if (
                action === "approve"
            ) {

                setMessage(
                    "Milestone approved successfully."
                );

            } else if (
                action === "changes"
            ) {

                setMessage(
                    "Changes requested from the freelancer."
                );

            } else {

                setMessage(
                    "Milestone cancelled successfully."
                );
            }

        } catch (err) {

            console.error(
                "Milestone review error:",
                err
            );

            setError(
                err.response?.data?.detail ||
                err.response?.data?.action ||
                "Unable to review milestone."
            );

        } finally {

            setReviewingId(null);

        }
    };


    // =====================================================
    // DELETE
    // CLIENT ONLY
    // =====================================================

    const handleDelete = async (
        milestoneId
    ) => {

        if (!isClient) {

            setError(
                "Only the project client can delete milestones."
            );

            return;
        }

        const confirmed =
            window.confirm(
                "Are you sure you want to delete this milestone?"
            );

        if (!confirmed) {
            return;
        }

        try {

            setDeletingId(
                milestoneId
            );

            setError("");
            setMessage("");

            /*
             * IMPORTANT:
             *
             * Use the canonical milestones endpoint.
             *
             * This also avoids the old nested
             * Project MilestoneDetailView.
             */

            await api.delete(
                `/milestones/${milestoneId}/`
            );

            setMilestones(
                previous =>
                    previous.filter(
                        milestone =>
                            milestone.id !==
                            milestoneId
                    )
            );

            setDraftProgress(
                previous => {

                    const updated = {
                        ...previous,
                    };

                    delete updated[
                        milestoneId
                    ];

                    return updated;
                }
            );

            setMessage(
                "Milestone deleted successfully."
            );

        } catch (err) {

            console.error(
                "Delete milestone error:",
                err
            );

            setError(
                err.response?.data?.detail ||
                "Unable to delete milestone."
            );

        } finally {

            setDeletingId(null);

        }
    };


    // =====================================================
    // FORMAT STATUS
    // =====================================================

    const formatStatus = (
        value
    ) => {

        if (!value) {
            return "Not available";
        }

        return value
            .replace(
                /_/g,
                " "
            )
            .toLowerCase()
            .replace(
                /\b\w/g,
                letter =>
                    letter.toUpperCase()
            );
    };


    // =====================================================
    // STATUS CLASS
    // =====================================================

    const getStatusClass = (
        value
    ) => {

        if (!value) {
            return "";
        }

        return value
            .toLowerCase()
            .replace(
                /_/g,
                "-"
            );
    };


    // =====================================================
    // FORMAT AMOUNT
    // =====================================================

    const formatAmount = (
        amount
    ) => {

        return new Intl.NumberFormat(
            "en-IN",
            {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 2,
            }
        ).format(
            Number(
                amount || 0
            )
        );
    };


    // =====================================================
    // FORMAT DATE
    // =====================================================

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


    // =====================================================
    // SUMMARY
    // =====================================================

    const completedCount =
        milestones.filter(
            milestone =>
                milestone.status ===
                "COMPLETED"
        ).length;


    const overallProgress =
        milestones.length === 0
            ? 0
            : Math.round(
                milestones.reduce(
                    (
                        total,
                        milestone
                    ) =>
                        total +
                        Number(
                            milestone.progress || 0
                        ),
                    0
                ) /
                milestones.length
            );


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (
            <div className="milestones-loading">

                <div className="milestones-spinner" />

                <p>
                    Loading milestones...
                </p>

            </div>
        );
    }


    // =====================================================
    // MAIN
    // =====================================================

    return (

        <section className="milestones-section">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="milestones-header">

                <div>

                    <span className="milestones-eyebrow">
                        PROJECT MANAGEMENT
                    </span>

                    <h2>
                        Milestones
                    </h2>

                    <p>
                        Break the project into
                        manageable stages and
                        track progress.
                    </p>

                </div>


                {/* CLIENT CREATE */}

                {isClient &&
                    projectStatus ===
                    "IN_PROGRESS" && (

                        <button
                            type="button"
                            className="milestone-create-button"
                            onClick={() => {

                                setError("");
                                setMessage("");

                                setShowCreateForm(
                                    previous =>
                                        !previous
                                );

                            }}
                        >

                            {showCreateForm
                                ? "Close"
                                : "+ Create Milestone"}

                        </button>
                    )}

            </div>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

                <div className="milestone-error">
                    {error}
                </div>

            )}


            {/* =================================================
                SUCCESS
            ================================================= */}

            {message && (

                <div className="milestone-success">
                    {message}
                </div>

            )}


            {/* =================================================
                CREATE FORM
            ================================================= */}

            {showCreateForm &&
                isClient &&
                projectStatus ===
                "IN_PROGRESS" && (

                    <form
                        className="milestone-form"
                        onSubmit={
                            handleCreate
                        }
                    >

                        <div className="milestone-form-header">

                            <div>

                                <h3>
                                    Create Milestone
                                </h3>

                                <p>
                                    Add milestone details
                                    for this project.
                                </p>

                            </div>

                            <button
                                type="button"
                                className="milestone-close"
                                onClick={
                                    resetForm
                                }
                            >
                                ×
                            </button>

                        </div>


                        <div className="milestone-form-grid">

                            {/* TITLE */}

                            <div className="form-group">

                                <label>
                                    Title
                                </label>

                                <input
                                    type="text"
                                    name="title"
                                    value={
                                        form.title
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Enter milestone title"
                                    required
                                />

                            </div>


                            {/* AMOUNT */}

                            <div className="form-group">

                                <label>
                                    Amount
                                </label>

                                <input
                                    type="number"
                                    name="amount"
                                    value={
                                        form.amount
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    min="0.01"
                                    step="0.01"
                                    placeholder="Enter amount"
                                    required
                                />

                            </div>


                            {/* DATE */}

                            <div className="form-group">

                                <label>
                                    Due Date
                                </label>

                                <input
                                    type="date"
                                    name="due_date"
                                    value={
                                        form.due_date
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                />

                            </div>


                            {/* STATUS */}

                            <div className="form-group">

                                <label>
                                    Initial Status
                                </label>

                                <input
                                    type="text"
                                    value="Planned"
                                    disabled
                                />

                            </div>


                            {/* DESCRIPTION */}

                            <div className="form-group full">

                                <label>
                                    Description
                                </label>

                                <textarea
                                    name="description"
                                    value={
                                        form.description
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Describe what this milestone includes..."
                                    rows="5"
                                />

                            </div>

                        </div>


                        <div className="milestone-create-info">

                            <span>
                                Progress starts at 0%.
                            </span>

                            <span>
                                Freelancer updates progress.
                            </span>

                            <span>
                                Client reviews completion.
                            </span>

                        </div>


                        <div className="milestone-form-actions">

                            <button
                                type="button"
                                className="milestone-cancel-button"
                                onClick={
                                    resetForm
                                }
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="milestone-submit-button"
                                disabled={
                                    creating
                                }
                            >

                                {creating
                                    ? "Creating..."
                                    : "Create Milestone"}

                            </button>

                        </div>

                    </form>
                )}


            {/* =================================================
                EMPTY
            ================================================= */}

            {milestones.length === 0 && (

                <div className="milestones-empty">

                    <div className="empty-icon">
                        ✓
                    </div>

                    <h3>
                        No milestones yet
                    </h3>

                    <p>
                        {isClient
                            ? "Create the first milestone to start tracking this project."
                            : "The project owner has not created any milestones yet."}
                    </p>

                    {isClient &&
                        projectStatus ===
                        "IN_PROGRESS" && (

                            <button
                                type="button"
                                className="milestone-create-button"
                                onClick={() => {

                                    setError("");
                                    setMessage("");
                                    setShowCreateForm(true);

                                }}
                            >
                                + Create First Milestone
                            </button>
                        )}

                </div>
            )}


            {/* =================================================
                MILESTONES
            ================================================= */}

            {milestones.length > 0 && (

                <>

                    {/* SUMMARY */}

                    <div className="milestone-summary">

                        <div>

                            <span>
                                Total Milestones
                            </span>

                            <strong>
                                {
                                    milestones.length
                                }
                            </strong>

                        </div>


                        <div>

                            <span>
                                Completed
                            </span>

                            <strong>
                                {
                                    completedCount
                                }
                            </strong>

                        </div>


                        <div>

                            <span>
                                Overall Progress
                            </span>

                            <strong>
                                {
                                    overallProgress
                                }%
                            </strong>

                        </div>

                    </div>


                    {/* CARDS */}

                    <div className="milestones-list">

                        {milestones.map(
                            milestone => {

                                const itemProgress =
                                    Math.max(
                                        0,
                                        Math.min(
                                            100,
                                            Number(
                                                milestone.progress ||
                                                0
                                            )
                                        )
                                    );

                                const currentDraft =
                                    Number(
                                        draftProgress[
                                            milestone.id
                                        ] ??
                                        itemProgress
                                    );

                                const isSaving =
                                    savingId ===
                                    milestone.id;

                                const isDeleting =
                                    deletingId ===
                                    milestone.id;

                                const isReviewing =
                                    reviewingId ===
                                    milestone.id;

                                const isSubmitted =
                                    milestone.status ===
                                    "SUBMITTED";

                                const isCompleted =
                                    milestone.status ===
                                    "COMPLETED";

                                const isCancelled =
                                    milestone.status ===
                                    "CANCELLED";

                                const isNeedsChanges =
                                    milestone.status ===
                                    "NEEDS_CHANGES";

                                return (

                                    <article
                                        className="milestone-card"
                                        key={
                                            milestone.id
                                        }
                                    >

                                        {/* =================================
                                            HEADER
                                        ================================== */}

                                        <div className="milestone-card-top">

                                            <div>

                                                <span className="milestone-number">
                                                    MILESTONE
                                                </span>

                                                <h3>
                                                    {
                                                        milestone.title
                                                    }
                                                </h3>

                                            </div>


                                            <span
                                                className={
                                                    `milestone-status ${getStatusClass(
                                                        milestone.status
                                                    )}`
                                                }
                                            >
                                                {
                                                    formatStatus(
                                                        milestone.status
                                                    )
                                                }
                                            </span>

                                        </div>


                                        {/* =================================
                                            DETAILS
                                        ================================== */}

                                        <div className="milestone-details">

                                            <div>

                                                <span>
                                                    Amount
                                                </span>

                                                <strong>
                                                    {
                                                        formatAmount(
                                                            milestone.amount
                                                        )
                                                    }
                                                </strong>

                                            </div>


                                            <div>

                                                <span>
                                                    Due Date
                                                </span>

                                                <strong>
                                                    {
                                                        formatDate(
                                                            milestone.due_date
                                                        )
                                                    }
                                                </strong>

                                            </div>

                                        </div>


                                        {/* DESCRIPTION */}

                                        {milestone.description && (

                                            <p className="milestone-description">
                                                {
                                                    milestone.description
                                                }
                                            </p>

                                        )}


                                        {/* =================================
                                            PROGRESS
                                        ================================== */}

                                        <div className="milestone-progress-section">

                                            <div className="progress-header">

                                                <span>
                                                    Progress
                                                </span>

                                                <strong>
                                                    {
                                                        itemProgress
                                                    }%
                                                </strong>

                                            </div>


                                            {/* READ ONLY BAR */}

                                            <div className="progress-track">

                                                <div
                                                    className="progress-fill"
                                                    style={{
                                                        width:
                                                            `${itemProgress}%`,
                                                    }}
                                                />

                                            </div>


                                            {/* =================================
                                                FREELANCER CONTROL
                                            ================================== */}

                                            {isFreelancer &&
                                                !isCompleted &&
                                                !isCancelled && (

                                                    <div className="freelancer-progress-control">

                                                        <label>
                                                            Update Progress
                                                        </label>

                                                        <input
                                                            type="range"
                                                            min="0"
                                                            max="100"
                                                            step="5"
                                                            value={
                                                                currentDraft
                                                            }
                                                            disabled={
                                                                isSaving ||
                                                                isSubmitted
                                                            }
                                                            onChange={
                                                                event =>
                                                                    handleProgressSlider(
                                                                        milestone.id,
                                                                        event
                                                                    )
                                                            }
                                                        />


                                                        <div className="progress-scale">

                                                            <span>
                                                                0%
                                                            </span>

                                                            <span>
                                                                25%
                                                            </span>

                                                            <span>
                                                                50%
                                                            </span>

                                                            <span>
                                                                75%
                                                            </span>

                                                            <span>
                                                                100%
                                                            </span>

                                                        </div>


                                                        {!isSubmitted && (

                                                            <button
                                                                type="button"
                                                                className="milestone-submit-button"
                                                                disabled={
                                                                    isSaving ||
                                                                    currentDraft ===
                                                                    itemProgress
                                                                }
                                                                onClick={() =>
                                                                    handleSaveProgress(
                                                                        milestone
                                                                    )
                                                                }
                                                            >

                                                                {isSaving
                                                                    ? "Saving..."
                                                                    : "Save Progress"}

                                                            </button>

                                                        )}


                                                        {isSubmitted && (

                                                            <p>
                                                                Waiting for client review.
                                                            </p>

                                                        )}


                                                        {isNeedsChanges && (

                                                            <p>
                                                                Client requested changes. Continue working and update the progress.
                                                            </p>

                                                        )}

                                                    </div>

                                                )}


                                            {/* =================================
                                                CLIENT REVIEW
                                            ================================== */}

                                            {isClient && (

                                                <div className="milestone-client-review">

                                                    <div className="milestone-client-info">

                                                        <span>
                                                            Freelancer progress:
                                                        </span>

                                                        <strong>
                                                            {
                                                                itemProgress
                                                            }%
                                                        </strong>

                                                    </div>


                                                    {/* SUBMITTED */}

                                                    {isSubmitted && (

                                                        <div className="milestone-review-actions">

                                                            <p>
                                                                This milestone is ready for your review.
                                                            </p>


                                                            <button
                                                                type="button"
                                                                className="milestone-approve-button"
                                                                disabled={
                                                                    isReviewing
                                                                }
                                                                onClick={() =>
                                                                    handleReview(
                                                                        milestone,
                                                                        "approve"
                                                                    )
                                                                }
                                                            >

                                                                {
                                                                    isReviewing
                                                                        ? "Processing..."
                                                                        : "Approve & Complete"
                                                                }

                                                            </button>


                                                            <button
                                                                type="button"
                                                                className="milestone-changes-button"
                                                                disabled={
                                                                    isReviewing
                                                                }
                                                                onClick={() =>
                                                                    handleReview(
                                                                        milestone,
                                                                        "changes"
                                                                    )
                                                                }
                                                            >
                                                                Request Changes
                                                            </button>

                                                        </div>

                                                    )}


                                                    {/* WAITING */}

                                                    {!isCompleted &&
                                                        !isCancelled &&
                                                        !isSubmitted && (

                                                            <p>
                                                                Waiting for the freelancer to complete this milestone.
                                                            </p>

                                                        )}


                                                    {/* COMPLETED */}

                                                    {isCompleted && (

                                                        <p>
                                                            ✓ This milestone has been approved and completed.
                                                        </p>

                                                    )}


                                                    {/* CANCELLED */}

                                                    {isCancelled && (

                                                        <p>
                                                            This milestone has been cancelled.
                                                        </p>

                                                    )}

                                                </div>

                                            )}

                                        </div>


                                        {/* =================================
                                            CLIENT ACTIONS
                                        ================================== */}

                                        {isClient &&
                                            !isCompleted &&
                                            !isCancelled && (

                                                <div className="milestone-card-actions">

                                                    <button
                                                        type="button"
                                                        className="milestone-cancel-button"
                                                        disabled={
                                                            isReviewing ||
                                                            isDeleting
                                                        }
                                                        onClick={() =>
                                                            handleReview(
                                                                milestone,
                                                                "cancel"
                                                            )
                                                        }
                                                    >

                                                        {isReviewing
                                                            ? "Processing..."
                                                            : "Cancel Milestone"}

                                                    </button>


                                                    <button
                                                        type="button"
                                                        className="milestone-delete-button"
                                                        disabled={
                                                            isDeleting ||
                                                            isReviewing
                                                        }
                                                        onClick={() =>
                                                            handleDelete(
                                                                milestone.id
                                                            )
                                                        }
                                                    >

                                                        {isDeleting
                                                            ? "Deleting..."
                                                            : "Delete Milestone"}

                                                    </button>

                                                </div>

                                            )}

                                    </article>
                                );
                            }
                        )}

                    </div>

                </>
            )}

        </section>
    );
}