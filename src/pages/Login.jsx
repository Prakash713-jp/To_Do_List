// src/pages/Login.jsx
import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";
import bgImage from '../assets/y.jpg';


const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, user } = useContext(AuthContext);

  // ✅ Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (res.ok) {
        login(data.user, data.token); // ✅ set context + localStorage
        // redirect handled by useEffect
      } else {
        alert(data.message || "Invalid credentials");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
    setLoading(false);
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center login-bg"
      style={{ width: "100vw", height: "100vh" }}
    >
      <div className="card login-card p-4 animate-login mt-5 mt-sm-4 mt-md-5">
        <h3 className="mb-2 text-center text-white">Welcome Back 👋</h3>
        <p className="text-center text-white-50 mb-4">Log in to continue</p>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input
              type="email"
              className="form-control"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="mb-3">
            <input
              type="password"
              className="form-control"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <div className="text-center mt-3">
          <small className="text-white-80">
            Forgot password?{" "}
            <span
              style={{ cursor: "pointer", color: "rgba(2, 23, 252, 1)" }}
              onClick={() => navigate("/reset-request")}
            >
              Reset here
            </span>
          </small>
        </div>

        <div className="text-center mt-2">
          <small className="text-white-80">
            Don’t have an account?{" "}
            <span
              style={{ cursor: "pointer", color: "rgba(2, 23, 252, 1)" }}
              onClick={() => navigate("/register")}
            >
              Register
            </span>
          </small>
        </div>
      </div>

      {/* Animation & Background Styles */}
      <style>{`
        .login-bg {
          background: url(${bgImage});
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        }

        .login-card {
          max-width: 400px;
          width: 90%;
          border-radius: 20px;
          background-color: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(2px);
          border: 1px solid rgba(0, 0, 0, 0.5);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.25);
        }

        .animate-login {
          opacity: 0;
          transform: translateY(50px);
          animation: fadeSlideUp 0.8s forwards;
        }

        @keyframes fadeSlideUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 576px) {
          .login-card {
            padding: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
