import React, { useMemo, useState } from "react";
import DoctorGuide from "./components/DoctorGuide.jsx";
import QuestionCard from "./components/QuestionCard.jsx";
import ProgressPills from "./components/ProgressPills.jsx";
import ResultsPanel from "./components/ResultsPanel.jsx";
import StartScreen from "./components/StartScreen.jsx";
import { demoQuestions } from "./data/demoQuestions.js";

export default function AppShell() {
  const [phase, setPhase] = useState("start");
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [ranked, setRanked] = useState([]);
  const [loading, setLoading] = useState(false);

  const questions = useMemo(() => demoQuestions, []);
  const currentQuestion = questions[stepIndex];

  function resetAll() {
    setPhase("start");
    setStepIndex(0);
    setAnswers([]);
    setRanked([]);
  }

  function onAnswer(opt) {
    setLoading(true);

    const nextAnswers = [
      ...answers,
      {
        qid: currentQuestion.id,
        label: currentQuestion.label,
        value: opt.value,
        text: opt.text
      }
    ];
    setAnswers(nextAnswers);

    setTimeout(() => {
      if (stepIndex >= questions.length - 1) {
        setRanked(makeDemoRanking(nextAnswers));
        setPhase("results");
      } else {
        setStepIndex(stepIndex + 1);
      }
      setLoading(false);
    }, 400);
  }

  if (phase === "start") {
    return <StartScreen onStart={() => setPhase("asking")} />;
  }

  if (phase === "results") {
    return (
      <ResultsPanel
        ranked={ranked}
        answers={answers}
        onRestart={resetAll}
      />
    );
  }

  return (
    <div className="container">
      <DoctorGuide
        mood={loading ? "thinking" : "neutral"}
        message="Answer the question as best you can."
      />
      <ProgressPills
        current={stepIndex + 1}
        total={questions.length}
        answered={answers.length}
      />
      <QuestionCard
        question={currentQuestion}
        disabled={loading}
        onAnswer={onAnswer}
      />
    </div>
  );
}

function makeDemoRanking() {
  return [
    { name: "Common cold", confidence: 0.55 },
    { name: "Flu (influenza)", confidence: 0.42 },
    { name: "COVID-19", confidence: 0.31 }
  ];
}
