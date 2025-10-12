import React, { useState } from "react";
import { FunnelFill, ArrowCounterclockwise, CheckCircle } from "react-bootstrap-icons";

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

const priorities = ["All", "Low", "Medium", "High", "Urgent"];

const Filters = ({ onApply }) => {
  const [category, setCategory] = useState("All");
  const [priority, setPriority] = useState("All");
  const [status, setStatus] = useState("All");

  const handleReset = () => {
    setCategory("All");
    setPriority("All");
    setStatus("All");
    onApply({ category: "All", priority: "All", status: "All" });
  };

  const handleApply = () => {
    onApply({ category, priority, status });
  };

  return (
    <div className="card border-0 shadow-lg rounded-4">
      <div className="card-header bg-primary text-white d-flex align-items-center gap-2">
        <FunnelFill size={18} />
        <h6 className="mb-0 fw-semibold">Filters</h6>
      </div>
      <div className="card-body">
        <div className="mb-2">
          <label className="form-label small fw-semibold text-secondary">Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="form-select form-select-sm">
            {categories.map((cat) => (
              <option key={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="mb-2">
          <label className="form-label small fw-semibold text-secondary">Priority</label>
          <select value={priority} onChange={(e) => setPriority(e.target.value)} className="form-select form-select-sm">
            {priorities.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </div>
        <div className="mb-2">
          <label className="form-label small fw-semibold text-secondary">Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="form-select form-select-sm">
            <option>All</option>
            <option>Pending</option>
            <option>Completed</option>
          </select>
        </div>
      </div>
      <div className="card-footer bg-light d-flex justify-content-end gap-2">
        <button className="btn btn-outline-secondary btn-sm" onClick={handleReset}>
          <ArrowCounterclockwise size={15} /> Reset
        </button>
        <button className="btn btn-primary btn-sm" onClick={handleApply}>
          <CheckCircle size={15} /> Apply
        </button>
      </div>
    </div>
  );
};

export default Filters;
