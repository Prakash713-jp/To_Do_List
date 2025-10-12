import React from "react";
import { getPriorityBadge, getCategoryBadge } from "../utils/statusMap";
import { FaExclamationCircle } from "react-icons/fa"; // for overdue icon

const TaskCard = ({ task }) => {
  const isOverdue = new Date(task.deadline) < new Date();

  return (
    <div
      className={`card mb-3 shadow-sm task-card animate__animated animate__fadeInUp ${
        isOverdue ? "border-danger" : ""
      }`}
      style={{ transition: "transform 0.2s, box-shadow 0.2s" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-5px)";
        e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.1)";
      }}
    >
      <div className="card-body d-flex justify-content-between align-items-center flex-wrap">
        {/* Left Section */}
        <div className="mb-2">
          <h6 className="card-title mb-1 fw-semibold">{task.title}</h6>
          <div className="d-flex flex-wrap gap-2">
            <span className={`badge ${getPriorityBadge(task.priority)}`}>
              {task.priority}
            </span>
            <span className={`badge ${getCategoryBadge(task.category)}`}>
              {task.category}
            </span>
          </div>
        </div>

        {/* Right Section */}
        <div className="text-end">
          <small
            className={`d-block fw-medium ${
              isOverdue ? "text-danger" : "text-muted"
            }`}
          >
            {task.deadline}
          </small>
          {isOverdue && (
            <span className="badge bg-danger d-flex align-items-center mt-1">
              <FaExclamationCircle className="me-1" /> Overdue
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
