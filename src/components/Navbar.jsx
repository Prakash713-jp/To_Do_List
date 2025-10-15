// src/components/Navbar.jsx
import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom"; 
import { AuthContext } from "../context/AuthContext"; // Assuming AuthContext exists
import {
    FaHive,
    FaUserCircle,
    FaHistory, // Icon for History
    FaChartLine, // Icon for Dashboard
    FaSignOutAlt, // Icon for Logout
} from "react-icons/fa";
// No need for react-toastify, xlsx, or file-saver in Navbar if download is moved
// to HistoryPage/dedicated button.

// Update Navbar to accept tasks data for the export feature (though we won't use it now)
const Navbar = ({ allTasksForExport }) => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    if (!user) return null;

    // No handleDownload function needed here anymore

    return (
        <nav
            className="navbar navbar-expand-lg shadow-sm sticky-top" // Added sticky-top for better UI
            style={{ background: 'linear-gradient(90deg, #0d6efd, #6610f2)' }}
        >
            <div className="container-fluid d-flex justify-content-between align-items-center">
                
                {/* Brand slightly from left */}
                <Link to="/dashboard" className="navbar-brand d-flex align-items-center fw-bold fs-4 text-white ms-3">
                    <FaHive className="me-2 text-warning" size={24} />
                    Task Karo
                </Link>


                {/* Toggler for mobile */}
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarSupportedContent"
                    aria-controls="navbarSupportedContent"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    {/* Standard Bootstrap Toggler Icon (often white/light) */}
                    <span className="navbar-toggler-icon" style={{ filter: 'invert(1)' }}></span> 
                </button>

                {/* Profile Dropdown on far right */}
                <div className="collapse navbar-collapse justify-content-end" id="navbarSupportedContent">
                    <ul className="navbar-nav align-items-center">
                        <li className="nav-item dropdown">
                            <button
                                className="btn btn-light dropdown-toggle d-flex align-items-center gap-2 rounded-pill px-3"
                                type="button"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                            >
                                <FaUserCircle size={20} className="text-primary" />
                                <span>{user.name}</span>
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end p-2 shadow" style={{ minWidth: '220px' }}>
                                
                                {/* Profile Info */}
                                <li className="px-3 py-2 border-bottom">
                                    <div className="d-flex align-items-center gap-2">
                                        <FaUserCircle size={30} className="text-primary" />
                                        <div>
                                            <h6 className="mb-0">{user.name}</h6>
                                            <small className="text-muted text-break">{user.email}</small>
                                        </div>
                                    </div>
                                </li>
                                
                                {/* 1. Dashboard Link (New) */}
                                <li>
                                    <Link className="dropdown-item d-flex align-items-center gap-2 mt-2" to="/dashboard">
                                        <FaChartLine className="text-primary" /> Dashboard
                                    </Link>
                                </li>

                                {/* 2. History Link */}
                                <li>
                                    <Link className="dropdown-item d-flex align-items-center gap-2" to="/history">
                                        <FaHistory className="text-info" /> Task History
                                    </Link>
                                </li>
                                
                                {/* Download option removed as it's best placed on the History page itself. */}
                                
                                <li><hr className="dropdown-divider" /></li>
                                
                                {/* 3. Logout Feature */}
                                <li>
                                    <button
                                        className="dropdown-item d-flex align-items-center gap-2 text-danger fw-bold"
                                        onClick={logout}
                                    >
                                        <FaSignOutAlt /> Logout
                                    </button>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;