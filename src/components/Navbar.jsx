// src/components/Navbar.jsx
import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { FaHive, FaUserCircle } from "react-icons/fa";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  if (!user) return null;

  return (
    <nav
      className="navbar navbar-expand-lg shadow-sm"
      style={{ background: 'linear-gradient(90deg, #0d6efd, #6610f2)' }}
    >
      <div className="container-fluid d-flex justify-content-between align-items-center">
        {/* Brand on far left */}
    {/* Brand slightly from left */}
<span className="navbar-brand d-flex align-items-center fw-bold fs-4 text-white ms-3">
  <FaHive className="me-2 text-warning" size={24} />
  Task Karo
</span>


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
          <span className="navbar-toggler-icon"></span>
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
                      <small className="text-muted">{user.email}</small>
                    </div>
                  </div>
                </li>
                <li>
                  <button className="dropdown-item mt-2" onClick={logout}>
                    Logout
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
