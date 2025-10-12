import React from "react";

const Progress = ({ completedPercent }) => {
  return (
    <div className="mb-4">
      <h6 className="fw-bold">Overall Progress</h6>
      <div className="progress" style={{ height: "25px" }}>
        <div
          className="progress-bar bg-success"
          role="progressbar"
          style={{ width: `${completedPercent}%`, transition: "width 0.5s" }}
          aria-valuenow={completedPercent}
          aria-valuemin="0"
          aria-valuemax="100"
        >
          {completedPercent}%
        </div>
      </div>
    </div>
  );
};

export default Progress;
