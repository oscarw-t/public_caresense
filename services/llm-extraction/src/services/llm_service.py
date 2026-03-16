import logging
from typing import List, Optional

from fastapi import Request
from langchain_openai import ChatOpenAI

from src.prompts.templates import (
    disease_explanation_prompt,
    extraction_prompt,
    question_prompt,
)
from src.utils.helpers import fallback_extract_symptoms, safe_json_list


logger = logging.getLogger(__name__)


async def get_llm(request: Request) -> ChatOpenAI:
    return request.app.state.llm


async def get_symptom_to_question(symptom: str, llm: ChatOpenAI) -> str:
    if llm is None:
        return f"Do you have {symptom}?"

    chain = question_prompt | llm
    response = await chain.ainvoke({"symptom": symptom})
    return response.content


async def get_disease_to_treatment(disease: str, llm: ChatOpenAI) -> str:
    return f"Treatment plan for {disease} is"


async def llm_extract_symptoms(answer_text: str, llm: Optional[ChatOpenAI] = None) -> List[str]:
    if llm is None:
        return fallback_extract_symptoms(answer_text)

    logger.debug("Invoking LLM extraction for answer text")
    try:
        chain = extraction_prompt | llm
        response = await chain.ainvoke({"answer_text": answer_text})
        extracted = safe_json_list(response.content or "")

        if extracted:
            logger.debug("LLM extracted %d symptom candidates", len(extracted))
            return extracted

        logger.debug("LLM returned no symptoms; falling back to keyword extraction")
        return fallback_extract_symptoms(answer_text)
    except Exception as exc:
        logger.warning(
            "LLM extraction failed; falling back to keyword extraction: %r",
            exc,
        )
        return fallback_extract_symptoms(answer_text)


async def generate_disease_explanation(
    disease: str,
    probability: float,
    present_symptoms: List[str],
    absent_symptoms: List[str],
    llm: Optional[ChatOpenAI] = None,
) -> str:
    """Generate a patient-friendly explanation of the current leading disease."""
    if llm is None:
        return ""

    chain = disease_explanation_prompt | llm
    response = await chain.ainvoke({
        "disease": disease,
        "probability": f"{probability:.2%}",
        "present_symptoms": "\n".join(f"- {symptom}" for symptom in present_symptoms),
        "absent_symptoms": "\n".join(f"- {symptom}" for symptom in absent_symptoms),
    })
    return response.content
