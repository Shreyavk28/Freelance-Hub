import { useEffect, useState } from "react";
import api from "../services/api";
import "./Milestones.css";


function getUser() {
    try {
        const savedUser = localStorage.getItem("user");

        if (!savedUser) {
            return null;
        }

        return JSON.parse(savedUser);

    } catch (error) {
        console.error("Unable to read logged-in user:", error);
        return null;
    }
}


export default function Milestones({
    projectId,
    projectStatus
}) {

    const user = getUser();

    const isClient =
        user?.role === "CLIENT";

    const isFreelancer =
        user?.role === "FREELANCER";


    const [milestones, setMilestones] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [showCreateForm, setShowCreateForm] =
        useState(false);

    const [saving, setSaving] =
        useState(false);

    const [creating, setCreating] =
        useState(false);


    const [form, setForm] = useState({
        title: "",
        amount: "",
        due_date: "",
        description: "",
    });


    // =================================================
    // LOAD MILESTONES
    // =================================================

    const loadMilestones = async () => {

        if (!projectId) {
            return;
        }

        try {

            setLoading(true);
            setError("");

            const response = await api.get(
                `/milestones/project/${projectId}/`
            );

            setMilestones(
                Array.isArray(response.data)
                    ? response.data
                    : []
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


    // =================================================
    // FORM CHANGE
    // =================================================

    const handleChange = (event) => {

        const {
            name,
            value
        } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value
        }));
    };


    // =================================================
    // CREATE MILESTONE
    // CLIENT ONLY
    // =================================================

    const handleCreate = async (event) => {

        event.preventDefault();

        if (!isClient) {

            setError(
                "Only the project owner can create milestones."
            );

            return;
        }


        if (projectStatus !== "IN_PROGRESS") {

            setError(
                "Milestones can only be created for projects that are in progress."
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


        if (Number(form.amount) <= 0) {

            setError(
                "Milestone amount must be greater than 0."
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


            const response = await api.post(
                `/milestones/project/${projectId}/`,
                {
                    title: form.title.trim(),
                    amount: form.amount,
                    due_date: form.due_date,
                    description: form.description.trim(),
                }
            );


            setMilestones((previous) => [
                ...previous,
                response.data
            ]);


            setForm({
                title: "",
                amount: "",
                due_date: "",
                description: "",
            });


            setShowCreateForm(false);

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


    // =================================================
    // UPDATE PROGRESS
    // FREELANCER ONLY
    // =================================================

    const handleProgress = async (
        milestoneId,
        progress
    ) => {

        if (!isFreelancer) {

            setError(
                "Only the assigned freelancer can update milestone progress."
            );

            return;
        }


        try {

            setSaving(true);
            setError("");


            const response =
                await api.patch(
                    `/milestones/${milestoneId}/progress/`,
                    {
                        progress
                    }
                );


            setMilestones((previous) =>
                previous.map((milestone) =>
                    milestone.id === milestoneId
                        ? response.data
                        : milestone
                )
            );

        } catch (err) {

            console.error(
                "Progress update error:",
                err
            );

            setError(
                err.response?.data?.detail ||
                "Unable to update milestone progress."
            );

        } finally {

            setSaving(false);
        }
    };


    // =================================================
    // CLIENT REVIEW
    // =================================================

    const handleReview = async (
        milestoneId,
        decision
    ) => {

        if (!isClient) {

            setError(
                "Only the project owner can review a milestone."
            );

            return;
        }


        try {

            setSaving(true);
            setError("");


            const response =
                await api.patch(
                    `/milestones/${milestoneId}/review/`,
                    {
                        decision
                    }
                );


            setMilestones((previous) =>
                previous.map((milestone) =>
                    milestone.id === milestoneId
                        ? response.data
                        : milestone
                )
            );

        } catch (err) {

            console.error(
                "Milestone review error:",
                err
            );

            setError(
                err.response?.data?.detail ||
                "Unable to review milestone."
            );

        } finally {

            setSaving(false);
        }
    };


    // =================================================
    // HELPERS
    // =================================================

    const formatStatus = (status) => {

        if (!status) {
            return "";
        }

        return status
            .replaceAll("_", " ")
            .toLowerCase()
            .replace(
                /\b\w/g,
                (letter) => letter.toUpperCase()
            );
    };


    const formatAmount = (amount) => {

        return new Intl.NumberFormat(
            "en-IN",
            {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 2
            }
        ).format(Number(amount || 0));
    };


    const formatDate = (date) => {

        if (!date) {
            return "-";
        }

        const parsedDate =
            new Date(`${date}T00:00:00`);

        if (Number.isNaN(parsedDate.getTime())) {
            return date;
        }

        return parsedDate.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    };


    const completedCount =
        milestones.filter(
            (milestone) =>
                milestone.status === "COMPLETED" ||
                Number(milestone.progress) === 100
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
                ) / milestones.length
            );


    // =================================================
    // LOADING
    // =================================================

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


    // =================================================
    // PAGE
    // =================================================

    return (

        <section className="milestones-section">

            {/* =========================================
                HEADER
            ========================================= */}

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


                {isClient &&
                    projectStatus === "IN_PROGRESS" && (

                        <button
                            type="button"
                            className="milestone-create-button"
                            onClick={() =>
                                setShowCreateForm(
                                    (previous) => !previous
                                )
                            }
                        >
                            + Create Milestone
                        </button>
                    )}

            </div>


            {/* =========================================
                ERROR
            ========================================= */}

            {error && (

                <div className="milestone-error">

                    <span>!</span>

                    {error}

                </div>
            )}


            {/* =========================================
                CREATE FORM
            ========================================= */}

            {showCreateForm &&
                isClient && (

                    <form
                        className="milestone-form"
                        onSubmit={handleCreate}
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
                                onClick={() =>
                                    setShowCreateForm(false)
                                }
                            >
                                ×
                            </button>

                        </div>


                        <div className="milestone-form-grid">

                            {/* TITLE */}

                            <div className="form-group">

                                <label htmlFor="milestone-title">
                                    Title
                                </label>

                                <input
                                    id="milestone-title"
                                    type="text"
                                    name="title"
                                    value={form.title}
                                    onChange={handleChange}
                                    placeholder="Enter milestone title"
                                    maxLength={200}
                                    required
                                />

                            </div>


                            {/* AMOUNT */}

                            <div className="form-group">

                                <label htmlFor="milestone-amount">
                                    Amount
                                </label>

                                <input
                                    id="milestone-amount"
                                    type="number"
                                    name="amount"
                                    value={form.amount}
                                    onChange={handleChange}
                                    min="0.01"
                                    step="0.01"
                                    placeholder="Enter amount"
                                    required
                                />

                            </div>


                            {/* DATE */}

                            <div className="form-group">

                                <label htmlFor="milestone-date">
                                    Due Date
                                </label>

                                <input
                                    id="milestone-date"
                                    type="date"
                                    name="due_date"
                                    value={form.due_date}
                                    onChange={handleChange}
                                    required
                                />

                            </div>


                            {/* STATUS */}

                            <div className="form-group">

                                <label>
                                    Status
                                </label>

                                <input
                                    type="text"
                                    value="Planned"
                                    disabled
                                    readOnly
                                />

                            </div>


                            {/* DESCRIPTION */}

                            <div className="form-group full">

                                <label htmlFor="milestone-description">
                                    Description
                                </label>

                                <textarea
                                    id="milestone-description"
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
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
                                The freelancer updates the progress.
                            </span>

                        </div>


                        <div className="milestone-form-actions">

                            <button
                                type="button"
                                className="milestone-cancel-button"
                                onClick={() =>
                                    setShowCreateForm(false)
                                }
                                disabled={creating}
                            >
                                Cancel
                            </button>


                            <button
                                type="submit"
                                className="milestone-submit-button"
                                disabled={creating}
                            >
                                {creating
                                    ? "Creating..."
                                    : "Create Milestone"}
                            </button>

                        </div>

                    </form>
                )}


            {/* =========================================
                EMPTY STATE
            ========================================= */}

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
                            : "The project owner has not created any milestones yet."
                        }
                    </p>


                    {isClient &&
                        projectStatus === "IN_PROGRESS" && (

                            <button
                                type="button"
                                className="milestone-create-button"
                                onClick={() =>
                                    setShowCreateForm(true)
                                }
                            >
                                + Create First Milestone
                            </button>
                        )}

                </div>
            )}


            {/* =========================================
                MILESTONES
            ========================================= */}

            {milestones.length > 0 && (

                <>

                    {/* SUMMARY */}

                    <div className="milestone-summary">

                        <div>

                            <span>
                                Total Milestones
                            </span>

                            <strong>
                                {milestones.length}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Completed
                            </span>

                            <strong>
                                {completedCount}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Overall Progress
                            </span>

                            <strong>
                                {overallProgress}%
                            </strong>

                        </div>

                    </div>


                    {/* LIST */}

                    <div className="milestones-list">

                        {milestones.map(
                            (milestone, index) => {

                                const progress =
                                    Math.min(
                                        100,
                                        Math.max(
                                            0,
                                            Number(
                                                milestone.progress || 0
                                            )
                                        )
                                    );


                                return (

                                    <article
                                        className="milestone-card"
                                        key={milestone.id}
                                    >

                                        {/* TOP */}

                                        <div className="milestone-card-top">

                                            <div>

                                                <span className="milestone-number">
                                                    MILESTONE {index + 1}
                                                </span>

                                                <h3>
                                                    {milestone.title}
                                                </h3>

                                            </div>


                                            <span
                                                className={
                                                    `milestone-status ${
                                                        String(
                                                            milestone.status || ""
                                                        ).toLowerCase()
                                                    }`
                                                }
                                            >
                                                {formatStatus(
                                                    milestone.status
                                                )}
                                            </span>

                                        </div>


                                        {/* DETAILS */}

                                        <div className="milestone-details">

                                            <div>

                                                <span>
                                                    Amount
                                                </span>

                                                <strong>
                                                    {formatAmount(
                                                        milestone.amount
                                                    )}
                                                </strong>

                                            </div>


                                            <div>

                                                <span>
                                                    Due Date
                                                </span>

                                                <strong>
                                                    {formatDate(
                                                        milestone.due_date
                                                    )}
                                                </strong>

                                            </div>

                                        </div>


                                        {/* DESCRIPTION */}

                                        {milestone.description && (

                                            <p className="milestone-description">
                                                {milestone.description}
                                            </p>
                                        )}


                                        {/* PROGRESS */}

                                        <div className="milestone-progress-section">

                                            <div className="progress-header">

                                                <span>
                                                    Progress
                                                </span>

                                                <strong>
                                                    {progress}%
                                                </strong>

                                            </div>


                                            <div className="progress-track">

                                                <div
                                                    className="progress-fill"
                                                    style={{
                                                        width: `${progress}%`
                                                    }}
                                                />

                                            </div>


                                            {/* =================================
                                                FREELANCER CONTROL
                                            ================================= */}

                                            {isFreelancer &&
                                                milestone.status !== "COMPLETED" && (

                                                    <div className="freelancer-progress-control">

                                                        <label>
                                                            Update your progress
                                                        </label>

                                                        <input
                                                            type="range"
                                                            min="0"
                                                            max="100"
                                                            step="5"
                                                            value={progress}
                                                            disabled={saving}
                                                            onChange={(event) =>
                                                                handleProgress(
                                                                    milestone.id,
                                                                    Number(
                                                                        event.target.value
                                                                    )
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

                                                    </div>
                                                )}


                                            {/* =================================
                                                SUBMITTED
                                            ================================= */}

                                            {milestone.status ===
                                                "SUBMITTED" && (

                                                <div className="milestone-submitted-message">

                                                    ✓ Freelancer has
                                                    submitted this
                                                    milestone for review.

                                                </div>
                                            )}


                                            {/* =================================
                                                CLIENT REVIEW
                                            ================================= */}

                                            {isClient &&
                                                milestone.status ===
                                                "SUBMITTED" && (

                                                    <div className="milestone-review-actions">

                                                        <button
                                                            type="button"
                                                            className="approve-button"
                                                            disabled={saving}
                                                            onClick={() =>
                                                                handleReview(
                                                                    milestone.id,
                                                                    "APPROVE"
                                                                )
                                                            }
                                                        >
                                                            ✓ Approve
                                                        </button>


                                                        <button
                                                            type="button"
                                                            className="changes-button"
                                                            disabled={saving}
                                                            onClick={() =>
                                                                handleReview(
                                                                    milestone.id,
                                                                    "REQUEST_CHANGES"
                                                                )
                                                            }
                                                        >
                                                            Request Changes
                                                        </button>

                                                    </div>
                                                )}


                                            {/* =================================
                                                NEEDS CHANGES
                                            ================================= */}

                                            {milestone.status ===
                                                "NEEDS_CHANGES" && (

                                                <div className="milestone-changes-message">

                                                    ↻ Changes requested.
                                                    Freelancer can continue
                                                    updating progress.

                                                </div>
                                            )}

                                        </div>

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