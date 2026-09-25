import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Milestones from "../components/Milestones";
import "./ProjectWorkspace.css";


function ProjectWorkspace() {
    const { projectId } = useParams();
    const navigate = useNavigate();

    const { user } = useAuth();

    /* =========================================
       WORKSPACE STATE
    ========================================= */

    const [workspace, setWorkspace] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [activeTab, setActiveTab] = useState("overview");


    /* =========================================
       MILESTONE STATE
    ========================================= */

    const [milestones, setMilestones] = useState([]);

    const [milestonesLoading, setMilestonesLoading] =
        useState(false);

    const [milestoneError, setMilestoneError] =
        useState("");

    const [milestoneMessage, setMilestoneMessage] =
        useState("");

    const [showMilestoneForm, setShowMilestoneForm] =
        useState(false);

    const [editingMilestoneId, setEditingMilestoneId] =
        useState(null);

    const [milestoneForm, setMilestoneForm] = useState({
        title: "",
        description: "",
        amount: "",
        due_date: "",
        status: "PLANNED",
        progress: 0,
    });


    /* =========================================
       LOAD WORKSPACE
    ========================================= */

    useEffect(() => {
        fetchWorkspace();
    }, [projectId]);


    const fetchWorkspace = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                `/workspaces/project/${projectId}/`
            );

            setWorkspace(response.data);

        } catch (err) {
            console.error(
                "Workspace error:",
                err
            );

            const message =
                err.response?.data?.detail ||
                "Unable to load project workspace.";

            setError(message);

        } finally {
            setLoading(false);
        }
    };


    /* =========================================
       LOAD MILESTONES
    ========================================= */

    const fetchMilestones = async () => {
        try {
            setMilestonesLoading(true);
            setMilestoneError("");

            const response = await api.get(
                `/projects/${projectId}/milestones/`
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

            setMilestoneError(
                err.response?.data?.detail ||
                    "Unable to load milestones."
            );

        } finally {
            setMilestonesLoading(false);
        }
    };


    /* =========================================
       LOAD MILESTONES WHEN TAB OPENS
    ========================================= */

    useEffect(() => {
        if (activeTab === "milestones") {
            fetchMilestones();
        }
    }, [activeTab, projectId]);


    /* =========================================
       MILESTONE FORM
    ========================================= */

    const handleMilestoneChange = (event) => {
        const { name, value } = event.target;

        setMilestoneForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };


    const resetMilestoneForm = () => {
        setMilestoneForm({
            title: "",
            description: "",
            amount: "",
            due_date: "",
            status: "PLANNED",
            progress: 0,
        });

        setEditingMilestoneId(null);
        setShowMilestoneForm(false);
    };


    const openCreateMilestoneForm = () => {
        setMilestoneError("");
        setMilestoneMessage("");

        setEditingMilestoneId(null);

        setMilestoneForm({
            title: "",
            description: "",
            amount: "",
            due_date: "",
            status: "PLANNED",
            progress: 0,
        });

        setShowMilestoneForm(true);
    };


    const handleEditMilestone = (milestone) => {
        setMilestoneError("");
        setMilestoneMessage("");

        setEditingMilestoneId(milestone.id);

        setMilestoneForm({
            title: milestone.title || "",
            description: milestone.description || "",
            amount: milestone.amount ?? "",
            due_date: milestone.due_date || "",
            status: milestone.status || "PLANNED",
            progress: Number(
                milestone.progress || 0
            ),
        });

        setShowMilestoneForm(true);

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };


    /* =========================================
       CREATE / UPDATE MILESTONE
    ========================================= */

    const handleMilestoneSubmit = async (event) => {
        event.preventDefault();

        setMilestoneError("");
        setMilestoneMessage("");

        if (!milestoneForm.title.trim()) {
            setMilestoneError(
                "Milestone title is required."
            );
            return;
        }

        if (!milestoneForm.amount) {
            setMilestoneError(
                "Milestone amount is required."
            );
            return;
        }

        if (!milestoneForm.due_date) {
            setMilestoneError(
                "Milestone due date is required."
            );
            return;
        }

        try {
            const milestoneData = {
                title:
                    milestoneForm.title.trim(),

                description:
                    milestoneForm.description.trim(),

                amount: Number(
                    milestoneForm.amount
                ),

                due_date:
                    milestoneForm.due_date,

                status:
                    milestoneForm.status,

                progress: Number(
                    milestoneForm.progress
                ),
            };


            if (editingMilestoneId) {

                await api.patch(
                    `/projects/milestones/${editingMilestoneId}/`,
                    milestoneData
                );

                setMilestoneMessage(
                    "Milestone updated successfully."
                );

            } else {

                await api.post(
                    `/projects/${projectId}/milestones/`,
                    milestoneData
                );

                setMilestoneMessage(
                    "Milestone created successfully."
                );
            }


            resetMilestoneForm();

            await fetchMilestones();

        } catch (err) {
            console.error(
                "Milestone save error:",
                err
            );

            const backendError =
                err.response?.data;

            if (
                backendError &&
                typeof backendError === "object"
            ) {
                const firstError =
                    Object.values(
                        backendError
                    )[0];

                setMilestoneError(
                    Array.isArray(firstError)
                        ? firstError[0]
                        : String(firstError)
                );
            } else {
                setMilestoneError(
                    "Unable to save milestone."
                );
            }
        }
    };


    /* =========================================
       DELETE MILESTONE
    ========================================= */

    const handleDeleteMilestone = async (
        milestoneId
    ) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this milestone?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setMilestoneError("");
            setMilestoneMessage("");

            await api.delete(
                `/projects/milestones/${milestoneId}/`
            );

            setMilestoneMessage(
                "Milestone deleted successfully."
            );

            await fetchMilestones();

        } catch (err) {
            console.error(
                "Milestone delete error:",
                err
            );

            setMilestoneError(
                err.response?.data?.detail ||
                    "Unable to delete milestone."
            );
        }
    };


    /* =========================================
       HELPERS
    ========================================= */

    const getStatusClass = (status) => {
        if (!status) {
            return "";
        }

        return status
            .toLowerCase()
            .replace(/_/g, "-");
    };


    const formatStatus = (status) => {
        if (!status) {
            return "Not available";
        }

        return status
            .replace(/_/g, " ")
            .toLowerCase()
            .replace(/\b\w/g, (letter) =>
                letter.toUpperCase()
            );
    };


    const formatDate = (date) => {
        if (!date) {
            return "Not available";
        }

        const parsedDate = new Date(date);

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


    const calculateProgress = () => {
        if (milestones.length === 0) {
            return 0;
        }

        const total = milestones.reduce(
            (sum, milestone) =>
                sum +
                Number(
                    milestone.progress || 0
                ),
            0
        );

        return Math.round(
            total / milestones.length
        );
    };


    const completedMilestones =
        milestones.filter(
            (milestone) =>
                milestone.status ===
                    "COMPLETED" ||
                Number(
                    milestone.progress
                ) === 100
        ).length;


    const progress =
        calculateProgress();


    /* =========================================
       NAVIGATION
    ========================================= */

    const handleBack = () => {
        if (user?.role === "CLIENT") {
            navigate("/projects");
        } else {
            navigate(
                "/freelancer/dashboard"
            );
        }
    };


    /* =========================================
       LOADING
    ========================================= */

    if (loading) {
        return (
            <div className="workspace-page">

                <div className="workspace-loading">

                    <div className="workspace-spinner"></div>

                    <p>
                        Loading workspace...
                    </p>

                </div>

            </div>
        );
    }


    /* =========================================
       ERROR
    ========================================= */

    if (error) {
        return (
            <div className="workspace-page">

                <div className="workspace-error-card">

                    <div className="workspace-error-icon">
                        !
                    </div>

                    <h2>
                        Unable to open workspace
                    </h2>

                    <p>
                        {error}
                    </p>

                    <div className="workspace-error-actions">

                        <button
                            className="workspace-secondary-button"
                            onClick={handleBack}
                        >
                            Go Back
                        </button>

                        <button
                            className="workspace-primary-button"
                            onClick={fetchWorkspace}
                        >
                            Try Again
                        </button>

                    </div>

                </div>

            </div>
        );
    }


    /* =========================================
       WORKSPACE NOT FOUND
    ========================================= */

    if (!workspace) {
        return (
            <div className="workspace-page">

                <div className="workspace-error-card">

                    <h2>
                        Workspace not found
                    </h2>

                    <p>
                        A workspace could not be
                        found for this project.
                    </p>

                    <button
                        className="workspace-primary-button"
                        onClick={handleBack}
                    >
                        Go Back
                    </button>

                </div>

            </div>
        );
    }


    /* =========================================
       MAIN UI
    ========================================= */

    return (
        <div className="workspace-page">

            {/* =====================================
                HEADER
            ====================================== */}

            <header className="workspace-header">

                <div className="workspace-header-left">

                    <button
                        className="workspace-back-button"
                        onClick={handleBack}
                        aria-label="Go back"
                    >
                        ←
                    </button>

                    <div>

                        <div className="workspace-breadcrumb">
                            Project Workspace
                        </div>

                        <h1>
                            {workspace.project_title}
                        </h1>

                    </div>

                </div>


                <div className="workspace-header-right">

                    <span
                        className={`workspace-status ${getStatusClass(
                            workspace.project_status
                        )}`}
                    >
                        {formatStatus(
                            workspace.project_status
                        )}
                    </span>

                </div>

            </header>


            {/* =====================================
                MAIN CONTENT
            ====================================== */}

            <main className="workspace-container">

                {/* =================================
                    PROJECT SUMMARY
                ================================== */}

                <section className="workspace-summary">

                    <div className="summary-item">

                        <span className="summary-label">
                            Client
                        </span>

                        <strong>
                            {workspace.client_username}
                        </strong>

                    </div>


                    <div className="summary-item">

                        <span className="summary-label">
                            Freelancer
                        </span>

                        <strong>
                            {workspace.freelancer_username}
                        </strong>

                    </div>


                    <div className="summary-item">

                        <span className="summary-label">
                            Workspace Created
                        </span>

                        <strong>
                            {formatDate(
                                workspace.created_at
                            )}
                        </strong>

                    </div>

                </section>


                {/* =================================
                    TABS
                ================================== */}

                <nav className="workspace-tabs">

                    <button
                        className={
                            activeTab === "overview"
                                ? "workspace-tab active"
                                : "workspace-tab"
                        }
                        onClick={() =>
                            setActiveTab("overview")
                        }
                    >
                        Overview
                    </button>


                    <button
                        className={
                            activeTab === "milestones"
                                ? "workspace-tab active"
                                : "workspace-tab"
                        }
                        onClick={() => {
                            setActiveTab(
                                "milestones"
                            );
                            setMilestoneMessage("");
                            setMilestoneError("");
                        }}
                    >
                        Milestones

                        {milestones.length > 0 && (
                            <span className="workspace-tab-count">
                                {milestones.length}
                            </span>
                        )}
                    </button>


                    <button
                        className={
                            activeTab === "files"
                                ? "workspace-tab active"
                                : "workspace-tab"
                        }
                        onClick={() =>
                            setActiveTab("files")
                        }
                    >
                        Files
                    </button>


                    <button
                        className={
                            activeTab === "messages"
                                ? "workspace-tab active"
                                : "workspace-tab"
                        }
                        onClick={() =>
                            setActiveTab("messages")
                        }
                    >
                        Messages
                    </button>


                    <button
                        className={
                            activeTab === "activity"
                                ? "workspace-tab active"
                                : "workspace-tab"
                        }
                        onClick={() =>
                            setActiveTab("activity")
                        }
                    >
                        Activity
                    </button>

                </nav>


                {/* =================================
                    TAB CONTENT
                ================================== */}

                <section className="workspace-content">


                    {/* =================================
                        OVERVIEW
                    ================================== */}

                    {activeTab === "overview" && (

                        <div className="workspace-overview">

                            <div className="workspace-card">

                                <div className="workspace-card-header">

                                    <div>

                                        <span className="workspace-card-eyebrow">
                                            PROJECT
                                        </span>

                                        <h2>
                                            {
                                                workspace.project_title
                                            }
                                        </h2>

                                    </div>

                                </div>


                                <div className="project-overview-grid">

                                    <div className="project-detail">

                                        <span>
                                            Project Status
                                        </span>

                                        <strong>
                                            {formatStatus(
                                                workspace.project_status
                                            )}
                                        </strong>

                                    </div>


                                    <div className="project-detail">

                                        <span>
                                            Client
                                        </span>

                                        <strong>
                                            {
                                                workspace.client_username
                                            }
                                        </strong>

                                    </div>


                                    <div className="project-detail">

                                        <span>
                                            Freelancer
                                        </span>

                                        <strong>
                                            {
                                                workspace.freelancer_username
                                            }
                                        </strong>

                                    </div>


                                    <div className="project-detail">

                                        <span>
                                            Workspace Created
                                        </span>

                                        <strong>
                                            {formatDate(
                                                workspace.created_at
                                            )}
                                        </strong>

                                    </div>

                                </div>

                            </div>


                            <div className="workspace-card">

                                <div className="workspace-card-header">

                                    <div>

                                        <span className="workspace-card-eyebrow">
                                            COLLABORATION
                                        </span>

                                        <h2>
                                            Project Progress
                                        </h2>

                                    </div>

                                </div>


                                <div className="workspace-progress">

                                    <div className="progress-step completed">

                                        <div className="progress-dot">
                                            ✓
                                        </div>

                                        <div>

                                            <strong>
                                                Project Started
                                            </strong>

                                            <p>
                                                The project has
                                                been accepted
                                                and moved to
                                                in-progress.
                                            </p>

                                        </div>

                                    </div>


                                    <div className="progress-line"></div>


                                    <div
                                        className={
                                            milestones.length >
                                            0
                                                ? "progress-step completed"
                                                : "progress-step"
                                        }
                                    >

                                        <div className="progress-dot">
                                            {milestones.length >
                                            0
                                                ? "✓"
                                                : "2"}
                                        </div>

                                        <div>

                                            <strong>
                                                Milestones
                                            </strong>

                                            <p>
                                                {milestones.length >
                                                0
                                                    ? `${milestones.length} milestone(s) created with ${progress}% overall progress.`
                                                    : "Create milestones to track project progress."}
                                            </p>

                                        </div>

                                    </div>


                                    <div className="progress-line"></div>


                                    <div
                                        className={
                                            progress === 100
                                                ? "progress-step completed"
                                                : "progress-step"
                                        }
                                    >

                                        <div className="progress-dot">
                                            {progress === 100
                                                ? "✓"
                                                : "3"}
                                        </div>

                                        <div>

                                            <strong>
                                                Project Completion
                                            </strong>

                                            <p>
                                                {progress ===
                                                100
                                                    ? "All milestones are complete."
                                                    : "Project completion will be reached when all milestones are completed."}
                                            </p>

                                        </div>

                                    </div>

                                </div>

                            </div>

                        </div>

                    )}


                    {/* =================================
                        MILESTONES
                    ================================== */}

                    {activeTab === "milestones" && (

                        <div className="milestones-workspace">

                            {/* HEADER */}

                            <div className="milestones-header">

                                <div>

                                    <span className="workspace-card-eyebrow">
                                        PROJECT MANAGEMENT
                                    </span>

                                    <h2>
                                        Milestones
                                    </h2>

                                    <p>
                                        Break the project
                                        into manageable
                                        stages and track
                                        progress.
                                    </p>

                                </div>


                                <button
                                    className="milestone-add-button"
                                    onClick={
                                        openCreateMilestoneForm
                                    }
                                >
                                    + Create Milestone
                                </button>

                            </div>


                            {/* ALERTS */}

                            {milestoneError && (
                                <div className="milestone-alert error">
                                    {milestoneError}
                                </div>
                            )}


                            {milestoneMessage && (
                                <div className="milestone-alert success">
                                    {milestoneMessage}
                                </div>
                            )}


                            {/* FORM */}

                            {showMilestoneForm && (

                                <div className="milestone-form-card">

                                    <div className="milestone-form-header">

                                        <div>

                                            <h3>
                                                {editingMilestoneId
                                                    ? "Edit Milestone"
                                                    : "Create Milestone"}
                                            </h3>

                                            <p>
                                                Add milestone
                                                details for
                                                this project.
                                            </p>

                                        </div>


                                        <button
                                            type="button"
                                            className="milestone-close-button"
                                            onClick={
                                                resetMilestoneForm
                                            }
                                        >
                                            ×
                                        </button>

                                    </div>


                                    <form
                                        onSubmit={
                                            handleMilestoneSubmit
                                        }
                                        className="milestone-form"
                                    >

                                        <div className="milestone-form-grid">

                                            <div className="milestone-field">

                                                <label>
                                                    Title
                                                </label>

                                                <input
                                                    type="text"
                                                    name="title"
                                                    value={
                                                        milestoneForm.title
                                                    }
                                                    onChange={
                                                        handleMilestoneChange
                                                    }
                                                    placeholder="Enter milestone title"
                                                    required
                                                />

                                            </div>


                                            <div className="milestone-field">

                                                <label>
                                                    Amount
                                                </label>

                                                <input
                                                    type="number"
                                                    name="amount"
                                                    value={
                                                        milestoneForm.amount
                                                    }
                                                    onChange={
                                                        handleMilestoneChange
                                                    }
                                                    placeholder="Enter amount"
                                                    min="0"
                                                    step="0.01"
                                                    required
                                                />

                                            </div>


                                            <div className="milestone-field">

                                                <label>
                                                    Due Date
                                                </label>

                                                <input
                                                    type="date"
                                                    name="due_date"
                                                    value={
                                                        milestoneForm.due_date
                                                    }
                                                    onChange={
                                                        handleMilestoneChange
                                                    }
                                                    required
                                                />

                                            </div>


                                            <div className="milestone-field">

                                                <label>
                                                    Status
                                                </label>

                                                <select
                                                    name="status"
                                                    value={
                                                        milestoneForm.status
                                                    }
                                                    onChange={
                                                        handleMilestoneChange
                                                    }
                                                >

                                                    <option value="PLANNED">
                                                        Planned
                                                    </option>

                                                    <option value="IN_PROGRESS">
                                                        In Progress
                                                    </option>

                                                    <option value="COMPLETED">
                                                        Completed
                                                    </option>

                                                    <option value="CANCELLED">
                                                        Cancelled
                                                    </option>

                                                </select>

                                            </div>


                                            <div className="milestone-field milestone-full">

                                                <label>
                                                    Description
                                                </label>

                                                <textarea
                                                    name="description"
                                                    value={
                                                        milestoneForm.description
                                                    }
                                                    onChange={
                                                        handleMilestoneChange
                                                    }
                                                    placeholder="Describe what this milestone includes..."
                                                    rows="4"
                                                />

                                            </div>


                                            <div className="milestone-field milestone-full">

                                                <div className="milestone-range-header">

                                                    <label>
                                                        Progress
                                                    </label>

                                                    <strong>
                                                        {
                                                            milestoneForm.progress
                                                        }
                                                        %
                                                    </strong>

                                                </div>

                                                <input
                                                    type="range"
                                                    name="progress"
                                                    min="0"
                                                    max="100"
                                                    value={
                                                        milestoneForm.progress
                                                    }
                                                    onChange={
                                                        handleMilestoneChange
                                                    }
                                                />

                                            </div>

                                        </div>


                                        <div className="milestone-form-actions">

                                            <button
                                                type="button"
                                                className="workspace-secondary-button"
                                                onClick={
                                                    resetMilestoneForm
                                                }
                                            >
                                                Cancel
                                            </button>

                                            <button
                                                type="submit"
                                                className="workspace-primary-button"
                                            >
                                                {editingMilestoneId
                                                    ? "Update Milestone"
                                                    : "Create Milestone"}
                                            </button>

                                        </div>

                                    </form>

                                </div>

                            )}


                            {/* SUMMARY */}

                            {!milestonesLoading &&
                                milestones.length > 0 && (

                                    <div className="milestone-summary-grid">

                                        <div className="milestone-summary-card">

                                            <span>
                                                Total Milestones
                                            </span>

                                            <strong>
                                                {
                                                    milestones.length
                                                }
                                            </strong>

                                        </div>


                                        <div className="milestone-summary-card">

                                            <span>
                                                Completed
                                            </span>

                                            <strong>
                                                {
                                                    completedMilestones
                                                }
                                            </strong>

                                        </div>


                                        <div className="milestone-summary-card">

                                            <span>
                                                Overall Progress
                                            </span>

                                            <strong>
                                                {progress}%
                                            </strong>

                                        </div>

                                    </div>

                                )}


                            {/* LOADING */}

                            {milestonesLoading && (

                                <div className="milestones-loading">

                                    <div className="workspace-spinner"></div>

                                    <p>
                                        Loading milestones...
                                    </p>

                                </div>

                            )}


                            {/* EMPTY */}

                            {!milestonesLoading &&
                                milestones.length === 0 &&
                                !milestoneError && (

                                    <div className="milestones-empty">

                                        <div className="milestones-empty-icon">
                                            ✓
                                        </div>

                                        <h3>
                                            No milestones yet
                                        </h3>

                                        <p>
                                            Create the first
                                            milestone to start
                                            tracking this
                                            project.
                                        </p>

                                        <button
                                            className="milestone-add-button"
                                            onClick={
                                                openCreateMilestoneForm
                                            }
                                        >
                                            + Create First
                                            Milestone
                                        </button>

                                    </div>

                                )}


                            {/* LIST */}

                            {!milestonesLoading &&
                                milestones.length > 0 && (

                                    <div className="milestone-list">

                                        {milestones.map(
                                            (milestone) => {

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

                                                return (
                                                    <div
                                                        className="milestone-item"
                                                        key={
                                                            milestone.id
                                                        }
                                                    >

                                                        <div className="milestone-item-top">

                                                            <div>

                                                                <h3>
                                                                    {
                                                                        milestone.title
                                                                    }
                                                                </h3>

                                                                <span
                                                                    className={`milestone-status ${getStatusClass(
                                                                        milestone.status
                                                                    )}`}
                                                                >
                                                                    {
                                                                        formatStatus(
                                                                            milestone.status
                                                                        )
                                                                    }
                                                                </span>

                                                            </div>


                                                            <strong>
                                                                ₹
                                                                {Number(
                                                                    milestone.amount ||
                                                                        0
                                                                ).toLocaleString(
                                                                    "en-IN"
                                                                )}
                                                            </strong>

                                                        </div>


                                                        {milestone.description && (
                                                            <p className="milestone-description">
                                                                {
                                                                    milestone.description
                                                                }
                                                            </p>
                                                        )}


                                                        <div className="milestone-meta">

                                                            <span>
                                                                Due:{" "}
                                                                <strong>
                                                                    {formatDate(
                                                                        milestone.due_date
                                                                    )}
                                                                </strong>
                                                            </span>


                                                            <span>
                                                                Progress:{" "}
                                                                <strong>
                                                                    {
                                                                        itemProgress
                                                                    }
                                                                    %
                                                                </strong>
                                                            </span>

                                                        </div>


                                                        <div className="milestone-progress-bar">

                                                            <div
                                                                className="milestone-progress-fill"
                                                                style={{
                                                                    width: `${itemProgress}%`,
                                                                }}
                                                            ></div>

                                                        </div>


                                                        <div className="milestone-item-actions">

                                                            <button
                                                                className="milestone-edit-button"
                                                                onClick={() =>
                                                                    handleEditMilestone(
                                                                        milestone
                                                                    )
                                                                }
                                                            >
                                                                Edit
                                                            </button>


                                                            <button
                                                                className="milestone-delete-button"
                                                                onClick={() =>
                                                                    handleDeleteMilestone(
                                                                        milestone.id
                                                                    )
                                                                }
                                                            >
                                                                Delete
                                                            </button>

                                                        </div>

                                                    </div>
                                                );
                                            }
                                        )}

                                    </div>

                                )}

                        </div>

                    )}


                    {/* =================================
                        FILES
                    ================================== */}

                    {activeTab === "files" && (

                        <div className="workspace-placeholder">

                            <div className="placeholder-icon">
                                ↥
                            </div>

                            <h2>
                                Project Files
                            </h2>

                            <p>
                                File upload and sharing
                                will be implemented
                                next.
                            </p>

                        </div>

                    )}


                    {/* =================================
                        MESSAGES
                    ================================== */}

                    {activeTab === "messages" && (

                        <div className="workspace-placeholder">

                            <div className="placeholder-icon">
                                ◌
                            </div>

                            <h2>
                                Project Messages
                            </h2>

                            <p>
                                Project-specific
                                messaging will be
                                implemented next.
                            </p>

                        </div>

                    )}


                    {/* =================================
                        ACTIVITY
                    ================================== */}

                    {activeTab === "activity" && (

                        <div className="workspace-placeholder">

                            <div className="placeholder-icon">
                                ◷
                            </div>

                            <h2>
                                Project Activity
                            </h2>

                            <p>
                                Project activity
                                tracking will be
                                implemented next.
                            </p>

                        </div>

                    )}

                </section>

            </main>

        </div>
    );
}


export default ProjectWorkspace;