import { useEffect, useRef, useState } from "react";

import api from "../services/api";

import "./ProjectFiles.css";


function ProjectFiles({ projectId, currentUser }) {

    const [files, setFiles] = useState([]);

    const [loading, setLoading] =
        useState(true);

    const [uploading, setUploading] =
        useState(false);

    const [deletingId, setDeletingId] =
        useState(null);

    const [error, setError] =
        useState("");

    const fileInputRef =
        useRef(null);


    /* =====================================================
       LOAD FILES
    ===================================================== */

    const loadFiles = async () => {

        if (!projectId) {
            return;
        }

        try {

            setLoading(true);
            setError("");

            const response = await api.get(
                `/workspaces/project/${projectId}/files/`
            );

            const data = response.data;

            if (Array.isArray(data)) {

                setFiles(data);

            } else if (
                data &&
                Array.isArray(data.results)
            ) {

                setFiles(data.results);

            } else {

                setFiles([]);

            }

        } catch (err) {

            console.error(
                "Failed to load project files:",
                err
            );

            setError(
                err.response?.data?.detail ||
                "Failed to load project files."
            );

        } finally {

            setLoading(false);

        }
    };


    /* =====================================================
       LOAD WHEN PROJECT CHANGES
    ===================================================== */

    useEffect(() => {

        loadFiles();

    }, [projectId]);


    /* =====================================================
       CHOOSE FILE
    ===================================================== */

    const handleChooseFile = () => {

        if (uploading) {
            return;
        }

        if (fileInputRef.current) {

            fileInputRef.current.click();

        }
    };


    /* =====================================================
       UPLOAD FILE
    ===================================================== */

    const handleFileChange = async (event) => {

        const selectedFile =
            event.target.files?.[0];

        if (!selectedFile) {
            return;
        }

        try {

            setUploading(true);
            setError("");

            const formData =
                new FormData();

            formData.append(
                "file",
                selectedFile
            );

            await api.post(
                `/workspaces/project/${projectId}/files/`,
                formData
            );

            /*
             * Clear input so the same file
             * can be selected again later.
             */

            event.target.value = "";

            await loadFiles();

        } catch (err) {

            console.error(
                "File upload failed:",
                err
            );

            setError(
                err.response?.data?.detail ||
                err.response?.data?.file?.[0] ||
                "Failed to upload file."
            );

        } finally {

            setUploading(false);

        }
    };


    /* =====================================================
       DELETE FILE
       
       BOTH CLIENT AND FREELANCER CAN DELETE
       ANY PROJECT FILE.
    ===================================================== */

    const handleDelete = async (fileId) => {

        if (!fileId) {
            return;
        }

        const confirmed =
            window.confirm(
                "Are you sure you want to delete this file?"
            );

        if (!confirmed) {
            return;
        }

        try {

            setDeletingId(fileId);
            setError("");

            await api.delete(
                `/workspaces/project/${projectId}/files/${fileId}/`
            );

            /*
             * Remove the deleted file immediately
             * from the frontend list.
             */

            setFiles((previousFiles) =>
                previousFiles.filter(
                    (file) =>
                        Number(file.id) !==
                        Number(fileId)
                )
            );

        } catch (err) {

            console.error(
                "File deletion failed:",
                err
            );

            setError(
                err.response?.data?.detail ||
                "Failed to delete file."
            );

        } finally {

            setDeletingId(null);

        }
    };


    /* =====================================================
       FILE URL
    ===================================================== */

    const getFileUrl = (file) => {

        if (file.file_url) {

            if (
                file.file_url.startsWith("http")
            ) {

                return file.file_url;

            }

            return (
                `http://127.0.0.1:8000` +
                file.file_url
            );
        }

        if (
            file.file &&
            typeof file.file === "string"
        ) {

            if (
                file.file.startsWith("http")
            ) {

                return file.file;

            }

            if (
                file.file.startsWith("/")
            ) {

                return (
                    `http://127.0.0.1:8000` +
                    file.file
                );

            }

            return (
                `http://127.0.0.1:8000/` +
                file.file
            );
        }

        return "#";
    };


    /* =====================================================
       FILE NAME
    ===================================================== */

    const getFileName = (file) => {

        if (file.original_name) {

            return file.original_name;

        }

        if (file.file_name) {

            return file.file_name;

        }

        if (file.filename) {

            return file.filename;

        }

        if (
            file.file &&
            typeof file.file === "string"
        ) {

            const parts =
                file.file.split("/");

            return parts[
                parts.length - 1
            ];

        }

        return "Project file";
    };


    /* =====================================================
       FILE TYPE
    ===================================================== */

    const getFileType = (file) => {

        const name =
            getFileName(file);

        const extension =
            name
                .split(".")
                .pop()
                ?.toLowerCase();


        if (extension === "pdf") {

            return "PDF";

        }


        if (
            [
                "jpg",
                "jpeg",
                "png",
                "gif",
                "webp"
            ].includes(extension)
        ) {

            return "IMG";

        }


        if (
            [
                "doc",
                "docx"
            ].includes(extension)
        ) {

            return "DOC";

        }


        if (
            [
                "xls",
                "xlsx",
                "csv"
            ].includes(extension)
        ) {

            return "XLS";

        }


        if (
            [
                "zip",
                "rar",
                "7z"
            ].includes(extension)
        ) {

            return "ZIP";

        }


        return "FILE";
    };


    /* =====================================================
       FILE SIZE
    ===================================================== */

    const formatFileSize = (bytes) => {

        if (
            bytes === null ||
            bytes === undefined
        ) {

            return "";

        }


        if (bytes === 0) {

            return "0 Bytes";

        }


        const units = [
            "Bytes",
            "KB",
            "MB",
            "GB"
        ];


        const index =
            Math.floor(
                Math.log(bytes) /
                Math.log(1024)
            );


        return (
            parseFloat(
                (
                    bytes /
                    Math.pow(
                        1024,
                        index
                    )
                ).toFixed(2)
            ) +
            " " +
            units[index]
        );
    };


    /* =====================================================
       DATE
    ===================================================== */

    const formatDate = (date) => {

        if (!date) {

            return "";

        }


        const parsedDate =
            new Date(date);


        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {

            return "";

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


    /* =====================================================
       UPLOADER NAME
    ===================================================== */

    const getUploaderName = (file) => {

        if (
            file.uploaded_by_username
        ) {

            return file.uploaded_by_username;

        }


        if (
            currentUser &&
            String(file.uploaded_by) ===
            String(currentUser.id)
        ) {

            return (
                currentUser.username ||
                "You"
            );

        }


        return "User";
    };


    /* =====================================================
       RENDER
    ===================================================== */

    return (

        <div className="project-files">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="project-files-header">

                <div>

                    <span className="project-files-label">
                        PROJECT FILES
                    </span>

                    <h2>
                        Files & Documents
                    </h2>

                    <p>
                        Files shared between the
                        client and freelancer.
                    </p>

                </div>


                <div className="project-files-actions">

                    <button
                        type="button"
                        className="refresh-files-btn"
                        onClick={loadFiles}
                        disabled={
                            loading ||
                            uploading
                        }
                    >
                        ↻ Refresh
                    </button>


                    <button
                        type="button"
                        className="upload-file-btn"
                        onClick={handleChooseFile}
                        disabled={uploading}
                    >

                        {uploading
                            ? "Uploading..."
                            : "+ Upload File"
                        }

                    </button>


                    <input
                        ref={fileInputRef}
                        type="file"
                        onChange={
                            handleFileChange
                        }
                        style={{
                            display: "none"
                        }}
                    />

                </div>

            </div>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

                <div className="files-error">

                    <span>
                        {error}
                    </span>

                    <button
                        type="button"
                        onClick={() =>
                            setError("")
                        }
                    >
                        ×
                    </button>

                </div>

            )}


            {/* =================================================
                LOADING
            ================================================= */}

            {loading ? (

                <div className="files-loading">

                    <div className="files-spinner"></div>

                    <p>
                        Loading files...
                    </p>

                </div>

            ) : files.length === 0 ? (


                /* =================================================
                   EMPTY STATE
                ================================================= */

                <div className="files-empty">

                    <div className="files-empty-icon">
                        ↑
                    </div>

                    <h3>
                        No files uploaded yet
                    </h3>

                    <p>
                        Upload project requirements,
                        designs, documents, reports,
                        source code, or final
                        deliverables.
                    </p>

                    <button
                        type="button"
                        onClick={
                            handleChooseFile
                        }
                        disabled={uploading}
                    >
                        Upload First File
                    </button>

                </div>


            ) : (


                /* =================================================
                   FILE LIST
                ================================================= */

                <div className="files-list">

                    {files.map((file) => {

                        const fileUrl =
                            getFileUrl(file);

                        const fileName =
                            getFileName(file);

                        const fileType =
                            getFileType(file);

                        const uploader =
                            getUploaderName(file);

                        const isDeleting =
                            Number(
                                deletingId
                            ) ===
                            Number(
                                file.id
                            );


                        return (

                            <div
                                className="file-card"
                                key={file.id}
                            >


                                {/* FILE ICON */}

                                <div className="file-icon">

                                    {fileType}

                                </div>


                                {/* FILE INFORMATION */}

                                <div className="file-info">

                                    <a
                                        href={fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="file-name"
                                    >
                                        {fileName}
                                    </a>


                                    <div className="file-meta">

                                        <span>
                                            Uploaded by{" "}
                                            <strong>
                                                {uploader}
                                            </strong>
                                        </span>


                                        {file.uploaded_at && (

                                            <span>
                                                {formatDate(
                                                    file.uploaded_at
                                                )}
                                            </span>

                                        )}


                                        {file.size && (

                                            <span>
                                                {formatFileSize(
                                                    file.size
                                                )}
                                            </span>

                                        )}

                                    </div>

                                </div>


                                {/* =================================================
                                   ACTIONS

                                   IMPORTANT:
                                   DELETE IS ALWAYS RENDERED.

                                   No uploaded_by check.
                                   No client/freelancer check.
                                   Both workspace participants get it.
                                ================================================= */}

                                <div className="file-actions">


                                    {/* OPEN */}

                                    <a
                                        href={fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="file-open-btn"
                                    >
                                        Open
                                    </a>


                                    {/* DELETE */}

                                    <button
                                        type="button"
                                        className="file-delete-btn"
                                        onClick={() =>
                                            handleDelete(
                                                file.id
                                            )
                                        }
                                        disabled={
                                            isDeleting
                                        }
                                    >

                                        {isDeleting
                                            ? "Deleting..."
                                            : "Delete"
                                        }

                                    </button>

                                </div>

                            </div>

                        );

                    })}

                </div>

            )}

        </div>

    );
}


export default ProjectFiles;