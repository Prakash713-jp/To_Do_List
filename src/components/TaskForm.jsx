import React, { useState, useEffect } from "react";

const categories = [
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

const priorities = ["Low", "Medium", "High", "Urgent"];

const TaskForm = ({ onSave, onClose, task }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState(""); // Added description
  const [category, setCategory] = useState("Work");
  const [priority, setPriority] = useState("Low");
  const [deadline, setDeadline] = useState("");

  // Pre-fill form if editing
  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setDescription(task.description || ""); // pre-fill description
      setCategory(task.category || "Work");
      setPriority(task.priority || "Low");
      setDeadline(task.deadline ? task.deadline.split("T")[0] : "");
    }
  }, [task]);

  // Disable background scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = "auto");
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !deadline) return;

    onSave({
      ...task, // keep _id if editing
      title: title.trim(),
      description: description.trim(), // save description
      category,
      priority,
      deadline,
    });
  };

  // Close modal on Escape
  useEffect(() => {
    const onEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          zIndex: 1050,
          backdropFilter: "blur(4px)",
          cursor: "pointer",
        }}
      />
      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        className="modal d-flex align-items-center justify-content-center"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1060,
          outline: "none",
          overflowY: "auto",
          padding: "1rem",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="card shadow"
          style={{
            width: "100%",
            maxWidth: "480px",
            borderRadius: "0.5rem",
            padding: "1.5rem 2rem",
            backgroundColor: "white",
          }}
        >
          <header className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="h5 m-0 text-primary">
              {task ? "✏️ Edit Task" : "➕ Add New Task"}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close task form"
              className="btn btn-outline-secondary btn-sm"
              style={{ lineHeight: 1 }}
            >
              ✖
            </button>
          </header>

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label htmlFor="taskTitle" className="form-label fw-semibold">
                Title <span className="text-danger">*</span>
              </label>
              <input
                id="taskTitle"
                type="text"
                className="form-control"
                placeholder="Enter task title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                autoFocus
                maxLength={100}
              />
            </div>

            {/* Description field */}
            <div className="mb-3">
              <label htmlFor="taskDescription" className="form-label fw-semibold">
                Description
              </label>
              <textarea
                id="taskDescription"
                className="form-control"
                placeholder="Enter task description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                maxLength={500}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="taskCategory" className="form-label fw-semibold">
                Category
              </label>
              <select
                id="taskCategory"
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label htmlFor="taskPriority" className="form-label fw-semibold">
                Priority
              </label>
              <select
                id="taskPriority"
                className="form-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                {priorities.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label htmlFor="taskDeadline" className="form-label fw-semibold">
                Deadline <span className="text-danger">*</span>
              </label>
              <input
                id="taskDeadline"
                type="date"
                className="form-control"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 fw-semibold"
              disabled={!title.trim() || !deadline}
            >
              {task ? "Update Task" : "Save Task"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default TaskForm;
