import React from "react";

export default function QuestionCard({ question, onAnswer, disabled }) {
  if (!question) return null;

  const options = question.options ?? [
    { value: "yes", text: "Yes" },
    { value: "no", text: "No" },
    { value: "unknown", text: "Not sure" }
  ];

  return (
    <div className="card">
      <div className="qTop">
        <div className="qTag">{question.category}</div>
        <div className="qKey">#{question.key}</div>
      </div>

      <h2 className="qTitle">{question.label}</h2>
      {question.help && <p className="qHelp">{question.help}</p>}

      <div className="btnRow">
        {options.map((opt) => (
          <button
            key={opt.value}
            className={opt.value === "yes" ? "primary" : opt.value === "no" ? "danger" : "soft"}
            disabled={disabled}
            onClick={() => onAnswer(opt)}
          >
            {opt.text}
          </button>
        ))}
      </div>

      {question.scale && (
        <div className="scaleHint">
          <span>Optional:</span> add intensity later (e.g., mild → severe).
        </div>
      )}
    </div>
  );
}
