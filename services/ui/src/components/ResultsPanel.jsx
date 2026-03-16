import React, { useState } from "react";

export default function ResultsPanel({ ranked, answers, onRestart }) {
  const [showAnswers, setShowAnswers] = useState(false);

  return (
    <div className="results">
      <div className="card">
        <h2>Top matches (demo)</h2>
        <p className="qHelp">
          In your real system, this list should come from the weighted deduction engine + retrieved explanations/tests.
        </p>

        <div className="rankList">
          {ranked.map((r) => (
            <div className="rankItem" key={r.name}>
              <div>
                <div className="rankName">{r.name}</div>
                <div className="rankSmall">Confidence: {Math.round(r.confidence * 100)}%</div>
              </div>
              <div className="rankBar">
                <div className="rankFill" style={{ width: `${Math.round(r.confidence * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div className="btnRow">
          <button className="soft" onClick={() => setShowAnswers((s) => !s)}>
            {showAnswers ? "Hide" : "Show"} my answers
          </button>
          <button className="primary" onClick={onRestart}>Restart</button>
        </div>

        {showAnswers && (
          <div className="answers">
            {answers.map((a) => (
              <div className="answerRow" key={a.qid}>
                <div className="ansQ">{a.label}</div>
                <div className="ansA">{a.text}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
