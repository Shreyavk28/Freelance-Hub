import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Milestones from "./Milestones";

import "./ProjectWorkspace.css";


function ProjectWorkspace() {

    const { projectId } = useParams();
    const navigate = useNavigate();

    const { user } = useAuth();


    /* =========================================
       WORKSPACE STATE
    ========================================= */

    const [workspace, setWorkspace] =
        useState(null);

    const [projectStatus, setProjectStatus] =
        useState(null);

    const [milestones, setMilestones] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [activeTab, setActiveTab] =
        useState("overview");


    /* =========================================
       CALCULATE PROJECT PROGRESS
    ========================================= */

    const calculateProgress = (milestoneList) => {

        if (
            !Array.isArray(milestoneList) ||
            milestoneList.length === 0
        ) {
            return 0;
        }

        const totalProgress =
            milestoneList.reduce(
                (total, milestone) =>
                    total +
                    Number(
                        milestone.progress || 0
                    ),
                0
            );

        return Math.round(
            totalProgress /
            milestoneList.length
        );
    };


    const progress =
        calculateProgress(milestones);


    const completedMilestones =
        milestones.filter(
            (milestone) =>
                milestone.status === "COMPLETED" &&
                Number(
                    milestone.progress || 0
                ) === 100
        ).length;


    const hasMilestones =
        milestones.length > 0;


    const milestonesCompleted =
        hasMilestones &&
        completedMilestones === milestones.length;


    /* =========================================
       LOAD WORKSPACE + PROJECT + MILESTONES
    ========================================= */

    useEffect(() => {

        fetchWorkspaceData();

    }, [projectId]);


    const fetchWorkspaceData = async () => {

        try {

            setLoading(true);
            setError("");

            const [
                workspaceResponse,
                projectResponse,
                milestonesResponse,
            ] = await Promise.all([

                api.get(
                    `/workspaces/project/${projectId}/`
                ),

                api.get(
                    `/projects/${projectId}/`
                ),

                api.get(
                    `/projects/${projectId}/milestones/`
                ),

            ]);


            setWorkspace(
                workspaceResponse.data
            );


            setProjectStatus(
                projectResponse.data?.status ||
                null
            );


            setMilestones(
                Array.isArray(
                    milestonesResponse.data
                )
                    ? milestonesResponse.data
                    : []
            );


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
       REFRESH PROJECT DATA
    ========================================= */

    const refreshProjectData = async () => {

        try {

            const [
                projectResponse,
                milestonesResponse,
            ] = await Promise.all([

                api.get(
                    `/projects/${projectId}/`
                ),

                api.get(
                    `/projects/${projectId}/milestones/`
                ),

            ]);


            const newStatus =
                projectResponse.data?.status ||
                null;


            setProjectStatus(
                newStatus
            );


            setMilestones(
                Array.isArray(
                    milestonesResponse.data
                )
                    ? milestonesResponse.data
                    : []
            );


            setWorkspace(
                (previous) =>
                    previous
                        ? {
                              ...previous,
                              project_status:
                                  newStatus,
                          }
                        : previous
            );


        } catch (err) {

            console.error(
                "Project refresh error:",
                err
            );

        }
    };


    /* =========================================
       REFRESH WHEN RETURNING TO OVERVIEW
    ========================================= */

    useEffect(() => {

        if (
            activeTab === "overview"
        ) {

            refreshProjectData();

        }

    }, [activeTab, projectId]);


    /* =========================================
       FORMAT STATUS
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
            .replace(
                /\b\w/g,
                (letter) =>
                    letter.toUpperCase()
            );
    };


    /* =========================================
       FORMAT DATE
    ========================================= */

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


    /* =========================================
       HANDLE PROJECT STATUS CHANGE
    ========================================= */

    const handleProjectStatusChange = (
        newStatus
    ) => {

        setProjectStatus(
            newStatus
        );


        setWorkspace(
            (previous) =>
                previous
                    ? {
                          ...previous,
                          project_status:
                              newStatus,
                      }
                    : previous
        );


        /*
         * Also refresh milestone data.
         */
        refreshProjectData();
    };


    /* =========================================
       HANDLE BACK
    ========================================= */

    const handleBack = () => {

        if (
            user?.role === "CLIENT"
        ) {

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
                            onClick={
                                fetchWorkspaceData
                            }
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


    const currentProjectStatus =
        projectStatus ||
        workspace.project_status;


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
                            {
                                workspace.project_title
                            }
                        </h1>

                    </div>

                </div>


                <div className="workspace-header-right">

                    <span
                        className={`workspace-status ${getStatusClass(
                            currentProjectStatus
                        )}`}
                    >
                        {formatStatus(
                            currentProjectStatus
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
                            {
                                workspace.client_username
                            }
                        </strong>

                    </div>


                    <div className="summary-item">

                        <span className="summary-label">
                            Freelancer
                        </span>

                        <strong>
                            {
                                workspace.freelancer_username
                            }
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
                            setActiveTab(
                                "overview"
                            )
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
                            setActiveTab(
                                "milestones"
                            )
                        }
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
                            setActiveTab(
                                "files"
                            )
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
                            setActiveTab(
                                "messages"
                            )
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
                            setActiveTab(
                                "activity"
                            )
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


                            {/* PROJECT INFORMATION */}

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
                                                currentProjectStatus
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


                            {/* =================================
                                PROJECT PROGRESS
                            ================================== */}

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


                                    {/* PROJECT STARTED */}

                                    <div
                                        className={
                                            currentProjectStatus ===
                                                "IN_PROGRESS" ||
                                            currentProjectStatus ===
                                                "COMPLETED"
                                                ? "progress-step completed"
                                                : "progress-step"
                                        }
                                    >

                                        <div className="progress-dot">

                                            {currentProjectStatus ===
                                                "IN_PROGRESS" ||
                                            currentProjectStatus ===
                                                "COMPLETED"
                                                ? "✓"
                                                : "1"}

                                        </div>


                                        <div>

                                            <strong>
                                                Project Started
                                            </strong>

                                            <p>

                                                {currentProjectStatus ===
                                                    "COMPLETED"

                                                    ? "The project was completed successfully."

                                                    : currentProjectStatus ===
                                                      "IN_PROGRESS"

                                                    ? "The project has been accepted and moved to in-progress."

                                                    : "The project has not started yet."}

                                            </p>

                                        </div>

                                    </div>


                                    <div className="progress-line"></div>


                                    {/* MILESTONES */}

                                    <div
                                        className={
                                            hasMilestones
                                                ? "progress-step completed"
                                                : "progress-step"
                                        }
                                    >

                                        <div className="progress-dot">

                                            {hasMilestones
                                                ? "✓"
                                                : "2"}

                                        </div>


                                        <div>

                                            <strong>
                                                Milestones
                                            </strong>

                                            <p>

                                                {hasMilestones

                                                    ? `${milestones.length} milestone${
                                                          milestones.length !== 1
                                                              ? "s"
                                                              : ""
                                                      } created with ${progress}% overall progress.`

                                                    : "Create milestones to track project progress."}

                                            </p>

                                        </div>

                                    </div>


                                    <div className="progress-line"></div>


                                    {/* PROJECT COMPLETION */}

                                    <div
                                        className={
                                            milestonesCompleted ||
                                            currentProjectStatus ===
                                                "COMPLETED"
                                                ? "progress-step completed"
                                                : "progress-step"
                                        }
                                    >

                                        <div className="progress-dot">

                                            {milestonesCompleted ||
                                            currentProjectStatus ===
                                                "COMPLETED"
                                                ? "✓"
                                                : "3"}

                                        </div>


                                        <div>

                                            <strong>
                                                Project Completion
                                            </strong>

                                            <p>

                                                {milestonesCompleted ||
                                                currentProjectStatus ===
                                                    "COMPLETED"

                                                    ? "All milestones are complete. The project has been completed."

                                                    : hasMilestones

                                                    ? `${completedMilestones} of ${milestones.length} milestones completed. Overall progress is ${progress}%.`

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

                        <Milestones
                            projectId={projectId}
                            projectStatus={
                                currentProjectStatus
                            }
                            onProjectStatusChange={
                                handleProjectStatusChange
                            }
                        />

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