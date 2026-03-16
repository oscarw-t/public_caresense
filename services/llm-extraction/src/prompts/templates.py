from langchain_core.prompts import ChatPromptTemplate

# Symptom → patient-friendly question
question_prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a medical assistant that converts symptoms into patient-friendly questions."),
    ("human", "Convert this symptom into a natural question for a patient: {symptom}"),
])

extraction_system_prompt = """
Extract the symptoms from the user's message.
Return ONLY valid JSON:
- a JSON array of short symptom strings (e.g. ["fever","cough"]).
- If none, return [].
- Do not include any extra text.
"""

extraction_prompt = ChatPromptTemplate([
    ("system", extraction_system_prompt),
    ("human", "{answer_text}"),
])

disease_explanation_system_prompt = """
You are a medical assistant explaining the output of a medical symptom-checking system.

The system has analyzed the patient's symptoms and estimated the likelihood of a possible disease.

Your task is to explain WHY this disease was suggested.

Guidelines:
- Use clear, medical doctor-friendly language.
- Briefly explain what the disease is.
- Explain how the PRESENT symptoms support this disease.
- Mention important symptoms that are ABSENT and how they affect the likelihood.
- Explain the meaning of the probability score in simple terms.
- Do NOT claim the patient definitely has the disease.
- Do NOT mention symptoms that are not provided.
- Keep the explanation concise (4-6 sentences).
- Frame the explanation as reasoning from the system's analysis.

The explanation should help the patient understand why this disease appears in the results.
"""

disease_explanation_prompt = ChatPromptTemplate.from_messages([
    ("system", disease_explanation_system_prompt),
    ("human", """
The system evaluated the patient's symptoms and produced the following result.

Disease: {disease}
Estimated probability: {probability}

Symptoms the patient HAS:
{present_symptoms}

Symptoms the patient DOES NOT have:
{absent_symptoms}

Explain why the system suggested this disease and what the probability means.
"""),
])
