import { useEffect, useState } from "react";

import api from "../services/api";

import "./Milestones.css";


export default function Milestones({
    projectId,
    projectStatus,
    onProjectStatusChange,
}) {

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
        reviewingId,
        setReviewingId
    ] = useState(null);

    const [
        deletingId,
        setDeletingId
    ] = useState(null);

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
    // NORMALIZE PROJECT STATUS
    // =====================================================

    const normalizedProjectStatus = String(
        projectStatus || ""
    )
        .trim()
        .replace(/[-\s]+/g, "_")
        .toUpperCase();


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

            const response =
                await api.get(
                    `/milestones/project/${projectId}/`
                );

            const data =
                Array.isArray(response.data)
                    ? response.data
                    : [];

            setMilestones(data);

            const progressMap = {};

            data.forEach(
                milestone => {

                    progressMap[
                        milestone.id
                    ] =
                        Number(
                            milestone.progress || 0
                        );
                }
            );

            setDraftProgress(
                progressMap
            );

        } catch (err) {

            console.error(
                "Milestones load error:",
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

        /*
         * For creation, the backend is the final authority.
         * The button itself is shown only to the project owner.
         */

        if (
            milestones.length > 0 &&
            !milestones[0].is_project_owner
        ) {

            setError(
                "Only the project client can create milestones."
            );

            return;
        }

        if (
            projectStatus &&
            normalizedProjectStatus !== "IN_PROGRESS"
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
                `/milestones/project/${projectId}/`,
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

            const responseData =
                err.response?.data;

            let createError =
                responseData?.detail ||
                responseData?.message;

            if (
                !createError &&
                responseData &&
                typeof responseData === "object"
            ) {

                createError =
                    Object.entries(
                        responseData
                    )
                        .map(
                            ([field, value]) => {

                                const detail =
                                    Array.isArray(value)
                                        ? value.join(", ")
                                        : String(value);

                                return `${field}: ${detail}`;
                            }
                        )
                        .join(" | ");
            }

            setError(
                createError ||
                "Unable to create milestone."
            );

        } finally {

            setCreating(false);
        }
    };


    // =====================================================
    // SLIDER
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
                [milestoneId]:
                    value,
            })
        );
    };


    // =====================================================
    // SAVE PROGRESS
    // ANY ASSIGNED FREELANCER
    // =====================================================

    const handleSaveProgress = async (
        milestone
    ) => {

        if (
            !milestone.can_update_progress
        ) {

            setError(
                "You are not an assigned freelancer for this project."
            );

            return;
        }

        const newProgress =
            Number(
                draftProgress[
                    milestone.id
                ] ??
                milestone.progress ??
                0
            );

        try {

            setSavingId(
                milestone.id
            );

            setError("");
            setMessage("");

            const response =
                await api.patch(
                    `/milestones/${milestone.id}/progress/`,
                    {
                        progress:
                            newProgress,
                    }
                );

            const updated =
                response.data;

            setMilestones(
                previous =>
                    previous.map(
                        item =>
                            item.id ===
                            milestone.id
                                ? updated
                                : item
                    )
            );

            setDraftProgress(
                previous => ({
                    ...previous,
                    [milestone.id]:
                        Number(
                            updated.progress || 0
                        ),
                })
            );

            if (
                Number(updated.progress) === 100
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

        if (
            !milestone.is_project_owner
        ) {

            setError(
                "Only the project client can review milestones."
            );

            return;
        }

        let confirmationMessage = "";

        if (action === "approve") {

            confirmationMessage =
                "Approve this milestone as completed?";

        } else if (action === "changes") {

            confirmationMessage =
                "Request changes from the freelancer?";

        } else if (action === "cancel") {

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

            const response =
                await api.patch(
                    `/milestones/${milestone.id}/review/`,
                    {
                        action,
                    }
                );

            const updated =
                response.data?.milestone;

            if (updated) {

                setMilestones(
                    previous =>
                        previous.map(
                            item =>
                                item.id ===
                                milestone.id
                                    ? updated
                                    : item
                        )
                );

                setDraftProgress(
                    previous => ({
                        ...previous,
                        [milestone.id]:
                            Number(
                                updated.progress || 0
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
                    "Milestone approved and completed successfully."
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
    // =====================================================

    const handleDelete = async (
        milestone
    ) => {

        if (
            !milestone.is_project_owner
        ) {

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
                milestone.id
            );

            setError("");
            setMessage("");

            await api.delete(
                `/milestones/${milestone.id}/`
            );

            setMilestones(
                previous =>
                    previous.filter(
                        item =>
                            item.id !==
                            milestone.id
                    )
            );

            setDraftProgress(
                previous => {

                    const updated = {
                        ...previous,
                    };

                    delete updated[
                        milestone.id
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
            .replace(/_/g, " ")
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
    // PROJECT OWNER
    // =====================================================

    const isProjectOwner =
        milestones.some(
            milestone =>
                milestone.is_project_owner
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

                {isProjectOwner &&
                    (!projectStatus ||
                        normalizedProjectStatus ===
                        "IN_PROGRESS") && (

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
                isProjectOwner && (

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
                        The project owner has not
                        created any milestones yet.
                    </p>

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


                                const isReviewing =
                                    reviewingId ===
                                    milestone.id;


                                const isDeleting =
                                    deletingId ===
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


                                const canUpdate =
                                    milestone.can_update_progress ===
                                    true;


                                const isClient =
                                    milestone.is_project_owner ===
                                    true;


                                return (

                                    <article
                                        className="milestone-card"
                                        key={
                                            milestone.id
                                        }
                                    >

                                        {/* =================================================
                                            HEADER
                                        ================================================= */}

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


                                        {/* =================================================
                                            DETAILS
                                        ================================================= */}

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


                                        {/* =================================================
                                            PROGRESS
                                        ================================================= */}

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


                                            <div className="progress-track">

                                                <div
                                                    className="progress-fill"
                                                    style={{
                                                        width:
                                                            `${itemProgress}%`,
                                                    }}
                                                />

                                            </div>


                                            {/* =================================================
                                                FREELANCER
                                            ================================================= */}

                                            {canUpdate &&
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
                                                            {
                                                                isSaving
                                                                    ? "Saving..."
                                                                    : "Save Progress"
                                                            }
                                                        </button>
                                                    )}


                                                    {isSubmitted && (

                                                        <p>
                                                            Waiting for client review.
                                                        </p>
                                                    )}


                                                    {isNeedsChanges && (

                                                        <p>
                                                            Client requested changes.
                                                            Continue working and update
                                                            the progress.
                                                        </p>
                                                    )}

                                                </div>
                                            )}


                                            {/* =================================================
                                                CLIENT REVIEW
                                            ================================================= */}

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
                                                                This milestone is ready
                                                                for your review.
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
                                                            Waiting for the freelancer
                                                            to complete this milestone.
                                                        </p>
                                                    )}


                                                    {/* COMPLETED */}

                                                    {isCompleted && (

                                                        <div className="milestone-completed-message">

                                                            <strong>
                                                                ✓ Completed
                                                            </strong>

                                                            <p>
                                                                This milestone has been
                                                                approved by the client
                                                                and is now completed.
                                                            </p>

                                                        </div>
                                                    )}


                                                    {/* CANCELLED */}

                                                    {isCancelled && (

                                                        <p>
                                                            This milestone has been
                                                            cancelled.
                                                        </p>
                                                    )}

                                                </div>
                                            )}

                                        </div>


                                        {/* =================================================
                                            CLIENT ACTIONS
                                        ================================================= */}

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

                                                    {
                                                        isReviewing
                                                            ? "Processing..."
                                                            : "Cancel Milestone"
                                                    }

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
                                                            milestone
                                                        )
                                                    }
                                                >

                                                    {
                                                        isDeleting
                                                            ? "Deleting..."
                                                            : "Delete Milestone"
                                                    }

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