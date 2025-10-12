// src/pages/Register.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import bgImage from '../assets/y.jpg';

const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("✅ Registration successful! Redirecting to login...");
        setTimeout(() => {
          navigate("/login");
        }, 2000); // 2s delay before redirect
      } else alert(data.message || "Registration failed");
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
      <div className="card login-card p-4 animate-login">

        {/* Success Notification */}
        {successMsg && (
          <div className="success-toast">{successMsg}</div>
        )}

        <h3 className="mb-2 text-center" style={{ color: "rgba(255,255,255,0.85)" }}>
          Create Your Account 🚀
        </h3>
        <p className="text-center mb-4" style={{ color: "rgba(255,255,255,0.7)" }}>
          Sign up and start using your workspace
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Full Name"
              style={{ color: "rgba(12, 5, 5, 0.85)" }}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="mb-3">
            <input
              type="email"
              className="form-control"
              placeholder="Email"
              style={{ color: "rgba(12, 5, 5, 0.85)" }}
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
              style={{ color: "rgba(12, 5, 5, 0.85)" }}
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
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <div className="text-center mt-3">
          <small style={{ color: "hsla(0, 50%, 99%, 1.00)" }}>
            Already have an account?{" "}
            <span
              style={{ cursor: "pointer", color: "rgba(2, 23, 252, 1)" }}
              onClick={() => navigate("/login")}
            >
              Log in
            </span>
          </small>
        </div>
      </div>

      {/* Styles */}
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
          position: relative;
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
.success-toast {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 480px;
  background: linear-gradient(135deg, #00b09b, #96c93d);
  color: #fff;
  padding: 16px 24px;
  border-radius: 0 0 12px 12px;
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideDown 0.6s ease, slideUp 0.6s ease 3s forwards;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  z-index: 9999;
  letter-spacing: 0.3px;
}

.success-toast::before {
  content: "";
  font-size: 18px;
}

@keyframes slideDown {
  from {
    transform: translate(-50%, -100%);
    opacity: 0;
  }
  to {
    transform: translate(-50%, 0);
    opacity: 1;
  }
}

@keyframes slideUp {
  to {
    transform: translate(-50%, -100%);
    opacity: 0;
  }
}

      `}</style>
    </div>
  );
};

export default Register;
