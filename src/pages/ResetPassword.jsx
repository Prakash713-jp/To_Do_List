// src/pages/ResetPassword.jsx
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import bgImage from '../assets/y.jpg';

const ResetPassword = () => {
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/reset/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: form.password }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || "Password reset successful!");
        navigate("/login");
      } else alert(data.message || "Failed to reset password.");
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
    setLoading(false);
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{
    backgroundImage: `url(${bgImage})`,
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'fixed',
    backgroundSize: 'cover',
  }}
    >
      <div
        className="card p-4 text-center"
        style={{
          width: "100%",
          maxWidth: "420px",
          borderRadius: "20px",
          background: "rgba(255,255,255,0.12)",
          backdropFilter: "blur(15px)",
          border: "1px solid rgba(255,255,255,0.25)",
          boxShadow: "0 10px 35px rgba(0,0,0,0.5)",
          color: "#fff",
        }}
      >
        <h3 className="mb-2" style={{ fontWeight: 700, fontSize: "1.8rem", letterSpacing: "1px" }}>
          Set New Password
        </h3>
        <p className="mb-4" style={{ color: "rgba(255,255,255,0.85)" }}>
          Enter your new password
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input
              type="password"
              placeholder="New Password"
              className="form-control"
              style={{
                borderRadius: "10px",
                background: "rgba(255,255,255,0.2)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.3)",
              }}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <div className="mb-3">
            <input
              type="password"
              placeholder="Confirm Password"
              className="form-control"
              style={{
                borderRadius: "10px",
                background: "rgba(255,255,255,0.2)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.3)",
              }}
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-success w-100"
            disabled={loading}
            style={{
              borderRadius: "10px",
              fontWeight: 600,
              boxShadow: "0 0 12px rgba(72,201,176,0.6)",
            }}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
