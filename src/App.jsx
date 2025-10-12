import React, { useEffect, useContext } from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetRequest from "./pages/ResetRequest";
import ResetPassword from "./pages/ResetPassword";
import TaskList from "./components/TaskList";
import TaskForm from "./components/TaskForm";
import CalendarPage from "./components/CalendarPage";

import { AuthProvider, AuthContext } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sudoku from "./pages/Sudoku";

// ✅ PUBLIC ROUTES
const publicPaths = ["/login", "/register", "/reset-request", "/reset"];

const isPublicPath = (pathname) => {
  return publicPaths.some((path) => pathname.startsWith(path));
};

// 🔒 Protected Route
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// 🧠 Layout + Routing
const AppContent = () => {
  const { loading } = useContext(AuthContext);
  const location = useLocation();
  const currentPath = location.pathname;

  const hideHeaderFooter = isPublicPath(currentPath);

  useEffect(() => {
    if (hideHeaderFooter) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }
  }, [hideHeaderFooter]);

  return (
    <>
      {!hideHeaderFooter && <Navbar />}

      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-request" element={<ResetRequest />} />
        <Route path="/reset/:token" element={<ResetPassword />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <div className="container mt-4">
                <Dashboard />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <TaskList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-task"
          element={
            <ProtectedRoute>
              <TaskForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <CalendarPage />
            </ProtectedRoute>
          }
        />
      </Routes>

      {!hideHeaderFooter && <Footer />}
    </>
  );
};

// ✅ App Wrapper
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-layout">
          <AppContent />
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
