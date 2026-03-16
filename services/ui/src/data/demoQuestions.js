export const demoQuestions = [
  {
    id: "q1",
    key: "fever",
    category: "Symptoms",
    label: "Do you currently have a fever (high temperature)?",
    help: "If you’re unsure, choose “Not sure”.",
    doctorPrompt: "First: temperature stuff. Easy one 🙂"
  },
  {
    id: "q2",
    key: "cough",
    category: "Symptoms",
    label: "Are you coughing a lot?",
    help: "Includes dry or productive cough.",
    doctorPrompt: "Got it. Next: cough."
  },
  {
    id: "q3",
    key: "sore_throat",
    category: "Symptoms",
    label: "Do you have a sore throat?",
    doctorPrompt: "Quick check on your throat."
  },
  {
    id: "q4",
    key: "chest_pain",
    category: "Symptoms",
    label: "Do you feel chest pain or tightness?",
    help: "If severe or sudden, seek urgent medical help (this UI doesn’t diagnose).",
    doctorPrompt: "Okay—this one matters. Answer carefully."
  },
  {
    id: "q5",
    key: "asthma_history",
    category: "Medical history",
    label: "Have you ever been diagnosed with asthma?",
    doctorPrompt: "Let’s include medical history—this can change weighting."
  },
  {
    id: "q6",
    key: "diabetes_history",
    category: "Medical history",
    label: "Have you ever been diagnosed with diabetes?",
    doctorPrompt: "Medical history helps me prioritize the right questions."
  },
  {
    id: "q7",
    key: "family_heart_disease",
    category: "Family history",
    label: "Any close family history of heart disease?",
    doctorPrompt: "Now family history—this can raise risk weights for some conditions."
  },
  {
    id: "q8",
    key: "family_autoimmune",
    category: "Family history",
    label: "Any close family history of autoimmune conditions?",
    doctorPrompt: "Last one for now—then I’ll summarize."
  }
];
