// src/pages/HistoryPage.jsx
import React, { useMemo, useState, useEffect, useContext } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
// import api from "../api/axios.js"; // ❌ REMOVE DIRECT AXIOS IMPORT (Already commented out)
import { AuthContext } from "../context/AuthContext"; // ✅ IMPORT AUTH CONTEXT
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
    FaTrash, // Used for single delete button
} from "react-icons/fa";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

// --- Configuration ---
const TASKS_PER_PAGE = 15; // Pagination setting

// --- Utility Function: Excel Export (UNCHANGED) ---
const exportToExcel = (data, fileName) => {
    if (data.length === 0) {
        toast.warning("No tasks to download.", {
            autoClose: 3000,
            theme: "colored",
        });
        return;
    }

    const dataForExport = data.map((task) => ({
        ID: task.originalTaskId || task._id || "N/A",
        Title: task.title,
        Description: task.description || "No description",
        Category: task.category || "N/A",
        Priority: task.priority || "N/A",
        Status: task.isDeleted
            ? "Deleted"
            : task.completed
            ? "Completed"
            : "Pending/Updated", // Updated status label for clarity
        "Action Logged At": new Date(task.createdAt).toLocaleString(),
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

// --- History Timestamp Formatter (UNCHANGED) ---
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
const HistoryPage = ({ NavbarComponent }) => {
    const navigate = useNavigate();
    // ✅ Use context to get state and functions
    const { history, fetchHistory, deleteHistoryRecord } = useContext(AuthContext);

    // 1. STATE FOR PAGINATION/UI
    const [historyData, setHistoryData] = useState([]); // Use local state for filtered/sorted/paginated view
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState("timestamp");
    const [sortOrder, setSortOrder] = useState("desc");
    const [currentPage, setCurrentPage] = useState(1); // Current Page

    // 2. DATA FETCHING & SYNC EFFECT
    // Fetch on mount, and re-run to update local state when context history changes
    useEffect(() => {
        // Only fetch if history is empty (e.g., initial load after login)
        // Otherwise, trust the `history` state from AuthContext
        if (history.length === 0 && loading) { // Added '&& loading' to prevent unnecessary fetches if component re-renders
            const loadData = async () => {
                await fetchHistory();
                // Set loading to false is handled below in the sync effect once history is populated.
                // We'll trust the sync effect to handle the final state update.
            };
            loadData();
        } else if (history.length > 0) {
            // When history is available (either from fetch or already in context), sync it.
            setHistoryData(history);
            setLoading(false);
        }
        // No dependency on 'loading' here to avoid loop, it's just to guard the initial fetch.
    }, [fetchHistory, history.length]); // Dependency on fetchHistory from context, and history.length for initial fetch check

    // Sync local historyData state with context history state (handles sorting/filtering/pagination)
    useEffect(() => {
        setHistoryData(history);
        setLoading(false); // Explicitly stop loading after history is set

        // Reset to page 1 if the history size decreases significantly
        const newTotalPages = Math.ceil(history.length / TASKS_PER_PAGE);
        if (currentPage > newTotalPages && newTotalPages > 0) {
            setCurrentPage(newTotalPages);
        } else if (history.length === 0) {
            setCurrentPage(1);
        }
    }, [history]); // Dependency on context history

    // 3. HISTORY RECORD DELETION LOGIC
    const handleDeleteRecord = async (recordId) => {
        if (!window.confirm("⚠️ Are you sure you want to permanently delete this history record? This cannot be undone and will remove the record from your history log.")) {
            return;
        }

        try {
            // ✅ Use the context function to delete the record
            await deleteHistoryRecord(recordId); 
            
            // The AuthContext automatically updates the global `history` state,
            // which triggers the useEffect above to update local `historyData` and handle pagination.
            
            toast.success("🗑️ History record deleted successfully!", { autoClose: 3000, theme: "colored" });
        } catch (error) {
            console.error("Error deleting history record:", error);
            toast.error("❌ Failed to delete history record. Please try again.", { autoClose: 3000, theme: "colored" });
        }
    };


    // 4. COMBINE and SORT TASKS (Memoized)
    const sortedHistoryTasks = useMemo(() => {
        let combined = historyData.map((t) => {
            // Ensure compatibility with the new taskSnapshot structure from the backend
            const taskDetails = t.taskSnapshot || {}; 

            return {
                ...t,
                originalTaskId: taskDetails._id || t.taskId,
                title: taskDetails.title || t.title || "No Title",
                description: taskDetails.description || t.description || "",
                category: taskDetails.category || t.category || "N/A",
                priority: taskDetails.priority || t.priority || "N/A",
                // Use the originalCreatedAt from the snapshot if available, otherwise fallback
                createdAt: taskDetails.originalCreatedAt || t.createdAt, 
                // Determine action status based on the `action` field or specific timestamps
                isDeleted: t.action === 'DELETED',
                completed: t.action === 'COMPLETED',
                // Determine the most relevant timestamp for sorting/display
                // Prioritize action-specific timestamps, then the context record's createdAt timestamp
                historyTimestamp: t.deletedAt || t.completedAt || t.updatedAt || t.createdAt,
            };
        });

        combined.sort((a, b) => {
            let comparison = 0;
            if (sortBy === "timestamp") {
                // Ensure valid dates for comparison
                const dateA = new Date(a.historyTimestamp || 0);
                const dateB = new Date(b.historyTimestamp || 0);
                comparison = dateA - dateB;
            } else if (sortBy === "title") {
                const titleA = a.title?.toUpperCase() || "";
                const titleB = b.title?.toUpperCase() || "";
                if (titleA > titleB) comparison = 1;
                else if (titleA < titleB) comparison = -1;
            }

            return sortOrder === "asc" ? comparison : comparison * -1;
        });

        return combined;
    }, [historyData, sortBy, sortOrder]); // Depend on local state

    // 5. PAGINATION CALCULATIONS
    const totalPages = Math.ceil(sortedHistoryTasks.length / TASKS_PER_PAGE);
    const indexOfLastTask = currentPage * TASKS_PER_PAGE;
    const indexOfFirstTask = indexOfLastTask - TASKS_PER_PAGE;
    // Slice the sorted array to get tasks for the current page
    const currentTasks = sortedHistoryTasks.slice(indexOfFirstTask, indexOfLastTask);

    const handlePageChange = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
            window.scrollTo({ top: 0, behavior: 'smooth' }); // Optional: Scroll to top on page change
        }
    };

    const handleSortChange = (newSortBy) => {
        setCurrentPage(1); // Reset page on sort change
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

    // Show loading spinner
    if (loading) {
        return (
            <div className="container-fluid py-5 text-center" style={{ minHeight: "100vh" }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-muted">Loading task history...</p>
            </div>
        );
    }

    // 6. RENDER LOGIC
    return (
        <div className="container-fluid py-4" style={{ minHeight: "100vh" }}>
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
                                        exportToExcel(sortedHistoryTasks, "Full_Task_History")
                                    }
                                    disabled={sortedHistoryTasks.length === 0}
                                    aria-label="Download History"
                                >
                                    <FaFileExcel size={16} /> Download All ({sortedHistoryTasks.length})
                                </button>
                            </div>
                        </div>

                        <div className="card-body p-0">
                            {currentTasks.length === 0 && sortedHistoryTasks.length === 0 ? (
                                <p className="text-center text-muted p-5">
                                    No task history found. Start creating or deleting tasks!
                                </p>
                            ) : currentTasks.length === 0 ? (
                                <p className="text-center text-muted p-5">
                                    No tasks found on this page. Try navigating to page 1.
                                </p>
                            ) : (
                                <ul className="list-group list-group-flush">
                                    {currentTasks.map((task) => {
                                        const actionTimeFormatted = formatHistoryTimestamp(
                                            task.historyTimestamp
                                        );

                                        let statusBadge, badgeClass, timeLabel;

                                        if (task.isDeleted) {
                                            statusBadge = (<><FaRegTrashAlt size={12} className="me-1" /> Deleted</>);
                                            badgeClass = "bg-danger";
                                            timeLabel = "Deleted At:";
                                        } else if (task.completed) {
                                            statusBadge = (<><FaCheckCircle size={12} className="me-1" /> Completed</>);
                                            badgeClass = "bg-success";
                                            timeLabel = "Completed At:";
                                        } else {
                                            // Covers PENDING/UPDATED actions (e.g., CREATED, UPDATED)
                                            statusBadge = (<><FaHourglassHalf size={12} className="me-1" /> Logged</>);
                                            badgeClass = "bg-info text-dark"; // Changed to info for general 'logged' action
                                            timeLabel = "Last Action:";
                                        }

                                        return (
                                            <li
                                                key={task._id}
                                                id={task._id}
                                                className={`list-group-item d-flex flex-column flex-md-row justify-content-between align-items-start py-3 ${task.isDeleted ? "bg-light" : ""}`}
                                                style={{
                                                    borderLeft: task.isDeleted
                                                        ? "5px solid #dc3545"
                                                        : task.completed ? "5px solid #198754" : "5px solid #0dcaf0", // Changed border for Logged to match badge-info
                                                    transition: 'background-color 0.3s',
                                                }}
                                            >
                                                <div className="d-flex flex-column flex-md-row align-items-start w-100">

                                                    {/* Task Details */}
                                                    <div className="flex-grow-1 me-md-3 mb-2 mb-md-0">
                                                        <h6 className={`mb-1 ${task.isDeleted ? "text-danger text-decoration-line-through" : "text-primary"}`}>
                                                            {task.title}
                                                        </h6>
                                                        <p className="text-muted small mb-1">
                                                            {task.description || "No description provided."}
                                                        </p>

                                                        {/* Metadata */}
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
                                                    </div>

                                                    {/* Status, Time, and Delete Button */}
                                                    <div className="d-flex flex-column flex-sm-row flex-md-column align-items-start align-items-sm-center align-items-md-end gap-2 text-md-end text-start" style={{ minWidth: "180px" }}>
                                                        <span className={`badge ${badgeClass} mb-1 d-inline-flex align-items-center`}>
                                                            {statusBadge}
                                                        </span>
                                                        <small className="text-secondary d-flex align-items-center justify-content-md-end justify-content-start gap-1 fw-bold">
                                                            <FaClock size={12} /> {timeLabel} {actionTimeFormatted}
                                                        </small>

                                                        {/* DELETE HISTORY RECORD BUTTON */}
                                                        <button
                                                            className="btn btn-sm btn-outline-danger mt-1"
                                                            onClick={(e) => {
                                                                e.stopPropagation(); // Prevent list-item click behavior
                                                                handleDeleteRecord(task._id);
                                                            }}
                                                            aria-label={`Permanently delete history record for ${task.title}`}
                                                            style={{ lineHeight: 1, padding: '0.25rem 0.5rem' }}
                                                        >
                                                            <FaTrash size={12} className="me-1" /> Delete Record
                                                        </button>
                                                    </div>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>

                        {/* PAGINATION CONTROLS */}
                        {totalPages > 1 && (
                            <div className="card-footer bg-white border-0 py-3">
                                <nav>
                                    <ul className="pagination justify-content-center flex-wrap">
                                        {/* Previous Button */}
                                        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                                            <button
                                                className="page-link"
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                disabled={currentPage === 1}
                                                aria-label="Previous Page"
                                            >
                                                Previous
                                            </button>
                                        </li>

                                        {/* Page Numbers - Basic Range Display (for brevity, showing all pages here) */}
                                        {Array.from({ length: totalPages }, (_, index) => (
                                            <li
                                                key={index + 1}
                                                className={`page-item ${
                                                    currentPage === index + 1 ? "active" : ""
                                                }`}
                                            >
                                                <button
                                                    className="page-link"
                                                    onClick={() => handlePageChange(index + 1)}
                                                >
                                                    {index + 1}
                                                </button>
                                            </li>
                                        ))}

                                        {/* Next Button */}
                                        <li
                                            className={`page-item ${
                                                currentPage === totalPages ? "disabled" : ""
                                            }`}
                                        >
                                            <button
                                                className="page-link"
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                disabled={currentPage === totalPages}
                                                aria-label="Next Page"
                                            >
                                                Next
                                            </button>
                                        </li>
                                    </ul>
                                </nav>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HistoryPage;