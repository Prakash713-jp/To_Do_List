import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import TaskForm from "./TaskForm";
import Filters from "./Filters";
import Progress from "./Progress";
import {
  PlusCircle,
  Calendar,
  CheckCircle,
  PencilSquare,
  Trash,
} from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const categories = [
  "All",
  "Work",
  "Personal",
  "Study",
  "Shopping",
  "Health",
  "Finance",
  "Travel",
  "Home",
  "Projects",
  "Events",
];

const TaskList = () => {
  const navigate = useNavigate();
  const {
    tasks,
    fetchTasks,
    addTask,
    updateTask,
    deleteTask,
  } = useContext(AuthContext);

  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filters, setFilters] = useState({
    category: "All",
    priority: "All",
    status: "All",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 3;

  useEffect(() => {
    fetchTasks();
  }, []);

  // ✅ Save task (add or update)
  const handleSaveTask = async (taskData) => {
    try {
      if (taskData._id) {
        await updateTask(taskData._id, taskData);
        toast.success("📝 Task updated!");
      } else {
        await addTask(taskData);
        toast.success("✅ Task added successfully!");
      }
      setShowForm(false);
      setEditingTask(null);
    } catch (err) {
      toast.error("❌ Failed to save task");
    }
  };

  // ✅ Toggle complete
  const handleToggleComplete = async (task) => {
    try {
      await updateTask(task._id, { completed: !task.completed });
      toast.success(task.completed ? "⏳ Marked as pending" : "🎉 Marked as done!");
    } catch (err) {
      toast.error("❌ Failed to update status");
    }
  };

  // ✅ Delete
  const handleDeleteTask = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await deleteTask(id);
      toast.error("🗑️ Task deleted");
    } catch (err) {
      toast.error("❌ Failed to delete task");
    }
  };

  const filteredTasks = tasks
    .filter((task) => {
      const categoryMatch =
        filters.category === "All" || task.category === filters.category;
      const priorityMatch =
        filters.priority === "All" || task.priority === filters.priority;
      const statusMatch =
        filters.status === "All" ||
        (filters.status === "Completed" ? task.completed : !task.completed);
      return categoryMatch && priorityMatch && statusMatch;
    })
    .sort((a, b) => {
      if (a.completed && !b.completed) return 1;
      if (!a.completed && b.completed) return -1;
      return new Date(a.deadline) - new Date(b.deadline);
    });

  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = filteredTasks.slice(indexOfFirstTask, indexOfLastTask);
  const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);

  const progress = tasks.length
    ? Math.round((tasks.filter((t) => t.completed).length / tasks.length) * 100)
    : 0;

  const toISTDate = (dateStr) => {
    const date = new Date(dateStr);
    const istOffset = 5.5 * 60;
    const utc = date.getTime() + date.getTimezoneOffset() * 60000;
    return new Date(utc + istOffset * 60000).toISOString().split("T")[0];
  };

  const getDeadlineLabel = (deadline) => {
    const now = new Date();
    const diffDays = Math.ceil(
      (new Date(deadline) - now) / (1000 * 60 * 60 * 24)
    );
    if (diffDays < 0) return { text: "Overdue", color: "danger" };
    if (diffDays <= 3)
      return { text: `Due in ${diffDays} day(s)`, color: "warning" };
    if (diffDays <= 10)
      return { text: `Due in ${diffDays} day(s)`, color: "info" };
    return { text: `Due on ${toISTDate(deadline)}`, color: "secondary" };
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case "High":
        return "badge rounded-pill bg-danger";
      case "Medium":
        return "badge rounded-pill bg-primary";
      case "Low":
        return "badge rounded-pill bg-success";
      case "Urgent":
        return "badge rounded-pill bg-dark";
      default:
        return "badge rounded-pill bg-secondary";
    }
  };

  const getCategoryBadgeClass = (category) => {
    switch (category) {
      case "Work":
        return "badge rounded-pill bg-success";
      case "Personal":
        return "badge rounded-pill bg-success";
      case "Study":
        return "badge rounded-pill bg-success";
      case "Shopping":
        return "badge rounded-pill bg-success";
      case "Health":
        return "badge rounded-pill bg-success";
      case "Finance":
        return "badge rounded-pill bg-success";
      case "Travel":
        return "badge rounded-pill bg-success";
      case "Home":
        return "badge rounded-pill bg-success";
      case "Projects":
        return "badge rounded-pill bg-success";
      case "Events":
        return "badge rounded-pill bg-success";
      default:
        return "badge rounded-pill bg-success";
    }
  };

  const getBorderColor = (priority) => {
    switch (priority) {
      case "High":
        return "#dc3545";
      case "Medium":
        return "#0d6efd";
      case "Low":
        return "#198754";
      case "Urgent":
        return "#343a40";
      default:
        return "#dee2e6";
    }
  };

  const headerStyle = {
    fontWeight: "700",
    fontSize: "1.5rem",
    background:
      "linear-gradient(270deg, #3390b8ff, #72d3f4ff, #176789ff, #6ee7b7, #3b82f6, #22d3ee)",
    backgroundSize: "600% 600%",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    animation: "shine 5s ease infinite",
  };

  return (
    <div className="container my-4">
  <style>{`
  @keyframes shine {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  .task-card {
    border-radius: 0.5rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    opacity: 0;
    animation: fadeIn 0.5s ease forwards;
    transform-style: preserve-3d;
    perspective: 1000px;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* Hover animation for individual card */
  .task-card:hover {
    transform: rotateX(3deg) rotateY(3deg) scale(1.05);
    box-shadow: 0 12px 28px rgba(0,0,0,0.25);
  }
`}</style>



      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 style={headerStyle}>📋 My Tasks</h4>
        <button
          className="btn btn-primary d-flex align-items-center gap-2"
          onClick={() => {
            setEditingTask(null);
            setShowForm(true);
          }}
        >
          <PlusCircle size={18} /> New Task
        </button>
      </div>

      <div className="row">
       <div
  className="col-12 col-md-4 col-lg-3 mb-4"
  style={{ position: "sticky", top: "85px", alignSelf: "flex-start" }}
>
          <Filters onApply={(appliedFilters) => setFilters(appliedFilters)} />
          <button
            className="btn btn-outline-primary w-100 mt-3 d-inline-flex align-items-center justify-content-center gap-2"
            onClick={() => navigate("/calendar")}
            style={{ whiteSpace: "nowrap", fontWeight: 600, fontSize: "1.05rem" }}
          >
            <Calendar size={19} /> View Calendar
          </button>
          
        </div>

        <div className="col-12 col-md-8 col-lg-9">
          <ul className="nav nav-tabs justify-content-center mb-4 flex-wrap">
            {categories.map((cat) => (
              <li className="nav-item" key={cat}>
                <button
                  className={`nav-link ${
                    filters.category === cat ? "active fw-bold" : ""
                  }`}
                  onClick={() => {
                    setFilters({ ...filters, category: cat });
                    setCurrentPage(1);
                  }}
                >
                  {cat}
                </button>
              </li>
            ))}
          </ul>

          <Progress completedPercent={progress} />

          <div className="mt-4 task-list-container">
            {currentTasks.length > 0 ? (
              currentTasks.map((task) => {
                const deadlineLabel = getDeadlineLabel(task.deadline);
                return (
                  <div
                    key={task._id}
                    className="card mb-3 task-card"
                    style={{
                      border: `1px solid ${getBorderColor(task.priority)}`,
                    }}
                  >
                    <div className="card-body d-flex justify-content-between align-items-center flex-wrap">
                      <div>
                        <h5
                          className={`mb-2 ${
                            task.completed
                              ? "text-decoration-line-through text-muted"
                              : ""
                          }`}
                        >
                          {task.title}
                          <span
                            className={`ms-2 badge rounded-pill ${
                              task.completed
                                ? "bg-success"
                                : "bg-warning text-dark"
                            }`}
                          >
                            {task.completed ? "✅ Done" : "⏳ Pending"}
                          </span>
                        </h5>

                        {/* Description */}
                        <p
                          className={`mb-2 text-secondary ${
                            task.completed ? "text-decoration-line-through" : ""
                          }`}
                        >
                          {task.description || "No description provided"}
                        </p>

                        <div className="d-flex flex-wrap gap-2 mb-2">
                          <span className={getPriorityBadgeClass(task.priority)}>
                            {task.priority}
                          </span>
                          <span className={getCategoryBadgeClass(task.category)}>
                            {task.category}
                          </span>
                          <span className="badge rounded-pill bg-light text-dark border">
                            Created: {toISTDate(task.createdAt)}
                          </span>
                          <span
                            className={`badge rounded-pill bg-${deadlineLabel.color}`}
                          >
                            {deadlineLabel.text}
                          </span>
                        </div>
                      </div>

                      <div className="d-flex flex-column gap-2">
                        <button
                          className={`btn btn-sm ${
                            task.completed ? "btn-success" : "btn-outline-success"
                          }`}
                          onClick={() => handleToggleComplete(task)}
                        >
                          <CheckCircle size={16} className="me-1" />
                          {task.completed ? "Completed" : "Mark Done"}
                        </button>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => {
                            setEditingTask(task);
                            setShowForm(true);
                          }}
                        >
                          <PencilSquare size={16} className="me-1" /> Edit
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteTask(task._id)}
                        >
                          <Trash size={16} className="me-1" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-muted text-center mt-5">No tasks found.</p>
            )}
          </div>

          {totalPages > 1 && (
            <nav className="mt-4">
              <ul className="pagination justify-content-center flex-wrap custom-pagination">
                <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  >
                    Previous
                  </button>
                </li>

                {Array.from({ length: totalPages }, (_, index) => (
                  <li
                    key={index}
                    className={`page-item ${
                      currentPage === index + 1 ? "active" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(index + 1)}
                    >
                      {index + 1}
                    </button>
                  </li>
                ))}

                <li
                  className={`page-item ${
                    currentPage === totalPages ? "disabled" : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </div>
      </div>

      {showForm && (
        <TaskForm
          task={editingTask}
          onSave={handleSaveTask}
          onClose={() => {
            setShowForm(false);
            setEditingTask(null);
          }}
        />
      )}
    </div>
  );
};

export default TaskList;
