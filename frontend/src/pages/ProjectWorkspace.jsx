import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

import "./ProjectWorkspace.css";


function ProjectWorkspace() {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [workspace, setWorkspace] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [activeTab, setActiveTab] = useState("overview");


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
            console.error("Workspace error:", err);

            const message =
                err.response?.data?.detail ||
                "Unable to load project workspace.";

            setError(message);

        } finally {
            setLoading(false);
        }
    };


    const getStatusClass = (status) => {
        if (!status) {
            return "";
        }

        return status
            .toLowerCase()
            .replace(/_/g, "-");
    };


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


    const handleBack = () => {
        if (user?.role === "CLIENT") {
            navigate("/projects");
        } else {
            navigate("/freelancer/dashboard");
        }
    };


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


    if (!workspace) {
        return (
            <div className="workspace-page">

                <div className="workspace-error-card">

                    <h2>
                        Workspace not found
                    </h2>

                    <p>
                        A workspace could not be found for
                        this project.
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


    return (
        <div className="workspace-page">

            {/* =========================================
                HEADER
            ========================================== */}

            <header className="workspace-header">

                <div className="workspace-header-left">

                    <button
                        className="workspace-back-button"
                        onClick={handleBack}
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
                        {workspace.project_status
                            ?.replace(/_/g, " ")}
                    </span>

                </div>

            </header>


            {/* =========================================
                MAIN CONTENT
            ========================================== */}

            <main className="workspace-container">

                {/* PROJECT SUMMARY */}

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


                {/* =====================================
                    TABS
                ====================================== */}

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
                        onClick={() =>
                            setActiveTab("milestones")
                        }
                    >
                        Milestones
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


                {/* =====================================
                    TAB CONTENT
                ====================================== */}

                <section className="workspace-content">


                    {/* OVERVIEW */}

                    {activeTab === "overview" && (

                        <div className="workspace-overview">

                            <div className="workspace-card">

                                <div className="workspace-card-header">

                                    <div>

                                        <span className="workspace-card-eyebrow">
                                            PROJECT
                                        </span>

                                        <h2>
                                            {workspace.project_title}
                                        </h2>

                                    </div>

                                </div>


                                <div className="project-overview-grid">

                                    <div className="project-detail">

                                        <span>
                                            Project Status
                                        </span>

                                        <strong>
                                            {workspace.project_status
                                                ?.replace(
                                                    /_/g,
                                                    " "
                                                )}
                                        </strong>

                                    </div>


                                    <div className="project-detail">

                                        <span>
                                            Client
                                        </span>

                                        <strong>
                                            {workspace.client_username}
                                        </strong>

                                    </div>


                                    <div className="project-detail">

                                        <span>
                                            Freelancer
                                        </span>

                                        <strong>
                                            {workspace.freelancer_username}
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
                                                The project has been
                                                accepted and moved
                                                to in-progress.
                                            </p>
                                        </div>

                                    </div>


                                    <div className="progress-line"></div>


                                    <div className="progress-step">

                                        <div className="progress-dot">
                                            2
                                        </div>

                                        <div>
                                            <strong>
                                                Milestones
                                            </strong>

                                            <p>
                                                Milestone management
                                                will be available here.
                                            </p>
                                        </div>

                                    </div>


                                    <div className="progress-line"></div>


                                    <div className="progress-step">

                                        <div className="progress-dot">
                                            3
                                        </div>

                                        <div>
                                            <strong>
                                                Project Completion
                                            </strong>

                                            <p>
                                                Completion tracking
                                                will be added later.
                                            </p>
                                        </div>

                                    </div>

                                </div>

                            </div>

                        </div>

                    )}


                    {/* MILESTONES */}

                    {activeTab === "milestones" && (

                        <div className="workspace-placeholder">

                            <div className="placeholder-icon">
                                ◫
                            </div>

                            <h2>
                                Milestones
                            </h2>

                            <p>
                                Milestone management will be
                                added next.
                            </p>

                        </div>

                    )}


                    {/* FILES */}

                    {activeTab === "files" && (

                        <div className="workspace-placeholder">

                            <div className="placeholder-icon">
                                ↥
                            </div>

                            <h2>
                                Project Files
                            </h2>

                            <p>
                                File upload and sharing will
                                be added after milestones.
                            </p>

                        </div>

                    )}


                    {/* MESSAGES */}

                    {activeTab === "messages" && (

                        <div className="workspace-placeholder">

                            <div className="placeholder-icon">
                                ◌
                            </div>

                            <h2>
                                Project Messages
                            </h2>

                            <p>
                                Project-specific messaging
                                will be added here.
                            </p>

                        </div>

                    )}


                    {/* ACTIVITY */}

                    {activeTab === "activity" && (

                        <div className="workspace-placeholder">

                            <div className="placeholder-icon">
                                ◷
                            </div>

                            <h2>
                                Project Activity
                            </h2>

                            <p>
                                Project activity tracking
                                will be added here.
                            </p>

                        </div>

                    )}

                </section>

            </main>

        </div>
    );
}


export default ProjectWorkspace;