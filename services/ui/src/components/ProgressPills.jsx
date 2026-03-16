import React from "react";

export default function ProgressPills({ current, total, answered }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="progress">
      <div className="progressTop">
        <div className="pill">Step {current} / {total}</div>
        <div className="pill ghostPill">{answered} answered</div>
      </div>
      <div className="bar">
        <div className="barFill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
