// src/pages/HistoryPage.jsx
import React, { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
    FaFileExcel,
    FaHistory,
    FaCheckCircle,
    FaHourglassHalf,
    FaRegTrashAlt,
    FaClock,
    FaCalendarAlt,
    FaSortAlphaDown,
    FaSortAlphaUp,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
// Assuming you have a standard Bootstrap setup for styling

// --- Utility Function: Excel Export ---
const exportToExcel = (data, fileName) => {
    if (data.length === 0) {
        toast.warning("No tasks to download.", {
            autoClose: 3000,
            theme: "colored",
        });
        return;
    }

    const dataForExport = data.map((task) => ({
        ID: task._id || "N/A",
        Title: task.title,
        Description: task.description || "No description",
        Category: task.category || "N/A",
        Priority: task.priority || "N/A",
        Status: task.isDeleted
            ? "Deleted"
            : task.completed
            ? "Completed"
            : "Pending",
        "Created Date/Time": new Date(task.createdAt).toLocaleString(),
        "Deadline Date/Time": task.deadline
            ? new Date(task.deadline).toLocaleString()
            : "N/A",
        // Uses the historyTimestamp calculated in the useMemo hook
        "Last Action Date/Time": task.historyTimestamp
            ? new Date(task.historyTimestamp).toLocaleString()
            : "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataForExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Task History");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });

    saveAs(blob, `${fileName}_${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success("Download complete!", { autoClose: 3000, theme: "colored" });
};

// --- History Timestamp Formatter ---
const formatHistoryTimestamp = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const timePart = date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
    const datePart = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
    return `${datePart} ${timePart}`;
};

// --- Main Component: HistoryPage ---
const HistoryPage = ({ tasks = [], deletedTasks = [], NavbarComponent }) => {
    const navigate = useNavigate();
    const [sortBy, setSortBy] = useState("timestamp"); // 'timestamp' or 'title'
    const [sortOrder, setSortOrder] = useState("desc"); // 'asc' or 'desc'

    // Combine and sort all tasks (Memoized for performance)
    const allHistoryTasks = useMemo(() => {
        // Active tasks (completed or pending) - Use updatedAt or createdAt for history
        const activeHistory = tasks.map((t) => ({
            ...t,
            isDeleted: false,
            // Prioritize updatedAt as 'last action', fall back to createdAt
            historyTimestamp: t.updatedAt || t.createdAt,
        }));

        // Deleted tasks - Use deletedAt or fallback to updatedAt/createdAt
        const deletedHistory = deletedTasks.map((t) => ({
            ...t,
            isDeleted: true,
            // Prioritize deletedAt, fall back to updatedAt, then createdAt
            historyTimestamp: t.deletedAt || t.updatedAt || t.createdAt,
        }));

        let combined = [...activeHistory, ...deletedHistory];

        // Sorting Logic
        combined.sort((a, b) => {
            let comparison = 0;
            if (sortBy === "timestamp") {
                const dateA = new Date(a.historyTimestamp);
                const dateB = new Date(b.historyTimestamp);
                comparison = dateA - dateB;
            } else if (sortBy === "title") {
                const titleA = a.title.toUpperCase();
                const titleB = b.title.toUpperCase();
                if (titleA > titleB) comparison = 1;
                else if (titleA < titleB) comparison = -1;
            }

            return sortOrder === "asc" ? comparison : comparison * -1;
        });

        return combined;
    }, [tasks, deletedTasks, sortBy, sortOrder]);

    const handleSortChange = (newSortBy) => {
        if (sortBy === newSortBy) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortBy(newSortBy);
            setSortOrder("desc"); // Default to descending for new sort
        }
    };

    const SortIcon = ({ currentSort }) => {
        if (sortBy !== currentSort) return null;
        return sortOrder === "asc" ? <FaSortAlphaUp size={12} className="ms-1" /> : <FaSortAlphaDown size={12} className="ms-1" />;
    };

    return (
        // Use a container fluid for full width responsiveness
        <div className="container-fluid py-4" style={{ minHeight: "100vh" }}>
            {/* The Navbar will likely be a separate component rendered above this content in App.jsx */}

            <div className="row justify-content-center">
                <div className="col-12 col-lg-10">
                    <div className="card shadow-lg border-0" style={{ borderRadius: "1rem" }}>
                        <div className="card-header bg-primary text-white p-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center" style={{ borderTopLeftRadius: "1rem", borderTopRightRadius: "1rem" }}>
                            <h2 className="d-flex align-items-center gap-2 m-0 fs-3">
                                <FaHistory /> Task History
                            </h2>
                            <div className="mt-3 mt-md-0 d-flex flex-wrap gap-2">
                                <button
                                    className="btn btn-sm btn-light text-dark d-flex align-items-center gap-1 fw-bold"
                                    onClick={() => handleSortChange("timestamp")}
                                >
                                    Sort by Date <SortIcon currentSort="timestamp" />
                                </button>
                                <button
                                    className="btn btn-sm btn-light text-dark d-flex align-items-center gap-1 fw-bold"
                                    onClick={() => handleSortChange("title")}
                                >
                                    Sort by Title <SortIcon currentSort="title" />
                                </button>

                                <button
                                    className="btn btn-sm btn-success d-flex align-items-center gap-1 fw-bold"
                                    onClick={() =>
                                        exportToExcel(allHistoryTasks, "Full_Task_History")
                                    }
                                    disabled={allHistoryTasks.length === 0}
                                    aria-label="Download History"
                                >
                                    <FaFileExcel size={16} /> Download All ({allHistoryTasks.length})
                                </button>
                            </div>
                        </div>

                        <div className="card-body p-0">
                            {allHistoryTasks.length === 0 ? (
                                <p className="text-center text-muted p-5">
                                    No task history found. Start creating or deleting tasks!
                                </p>
                            ) : (
                                <ul className="list-group list-group-flush">
                                    {allHistoryTasks.map((task) => {
                                        const actionTimeFormatted = formatHistoryTimestamp(
                                            task.historyTimestamp
                                        );

                                        let statusBadge, badgeClass, timeLabel;

                                        if (task.isDeleted) {
                                            statusBadge = (<><FaRegTrashAlt size={12} className="me-1" /> Deleted</>);
                                            badgeClass = "bg-danger";
                                            // The timestamp is now guaranteed to be deletedAt or equivalent
                                            timeLabel = "Deleted At:"; 
                                        } else if (task.completed) {
                                            statusBadge = (<><FaCheckCircle size={12} className="me-1" /> Completed</>);
                                            badgeClass = "bg-success";
                                            timeLabel = "Completed At:";
                                        } else {
                                            statusBadge = (<><FaHourglassHalf size={12} className="me-1" /> Pending</>);
                                            badgeClass = "bg-warning text-dark";
                                            timeLabel = "Last Action:";
                                        }

                                        return (
                                            <li
                                                key={task._id + (task.isDeleted ? "-del" : "-active")}
                                                className={`list-group-item d-flex flex-column py-3 ${task.isDeleted ? "bg-light" : ""}`}
                                                style={{
                                                    borderLeft: task.isDeleted
                                                        ? "5px solid #dc3545"
                                                        : task.completed ? "5px solid #198754" : "5px solid #ffc107",
                                                    cursor: task.isDeleted ? "pointer" : "default",
                                                }}
                                                // Optional: Navigate to a detailed deleted task view if needed
                                                onClick={() => {
                                                    if (task.isDeleted) {
                                                        // Example navigation - adjust this route as needed
                                                        // navigate(`/deleted-task-detail/${task._id}`); 
                                                        toast.info("Showing deleted task details is not implemented in this demo.", { autoClose: 3000, theme: "colored" });
                                                    }
                                                }}
                                            >
                                                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start">
                                                    <div className="flex-grow-1 me-md-3 mb-2 mb-md-0">
                                                        <h6 className={`mb-1 ${task.isDeleted ? "text-danger text-decoration-line-through" : "text-primary"}`}>
                                                            {task.title}
                                                        </h6>
                                                        <p className="text-muted small mb-1">
                                                            {task.description || "No description provided."}
                                                        </p>
                                                    </div>

                                                    <div className="text-md-end text-start" style={{ minWidth: "180px" }}>
                                                        <span className={`badge ${badgeClass} mb-1 d-inline-flex align-items-center`}>
                                                            {statusBadge}
                                                        </span>
                                                        <small className="text-secondary d-flex align-items-center justify-content-md-end justify-content-start gap-1 fw-bold">
                                                            <FaClock size={12} /> {timeLabel} {actionTimeFormatted}
                                                        </small>
                                                    </div>
                                                </div>

                                                <div className="mt-2 small text-muted d-flex flex-wrap gap-3">
                                                    <span>
                                                        Category: <strong className="text-dark">{task.category || "N/A"}</strong>
                                                    </span>
                                                    <span>
                                                        Priority: <strong className="text-dark">{task.priority || "N/A"}</strong>
                                                    </span>
                                                    <span>
                                                        <FaCalendarAlt size={10} className="me-1" /> Created:{" "}
                                                        <strong className="text-dark">
                                                            {new Date(task.createdAt).toLocaleDateString()}
                                                        </strong>
                                                    </span>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HistoryPage;