import logging
import os
from typing import Any, Dict, List

from langchain_openai import ChatOpenAI

from src.models.requests import NextRequest
from src.services.deduction_service import call_deduction_service
from src.services.dialogue_service import pick_next_question_from_top10
from src.services.llm_service import (
    generate_disease_explanation,
    llm_extract_symptoms,
)
from src.utils.config_loader import settings
from src.utils.helpers import fallback_extract_symptoms, normalize_choice


SESSIONS: Dict[str, Dict[str, Any]] = {}
logger = logging.getLogger(__name__)


def _get_top_candidate(deduction_response: Dict[str, Any]) -> Dict[str, Any]:
    top10 = deduction_response.get("top10", [])
    if isinstance(top10, list) and top10:
        return top10[0]
    return {}


async def handle_next(request: NextRequest, llm: ChatOpenAI) -> Dict[str, Any]:
    sid = request.sessionId or os.urandom(6).hex()

    if sid not in SESSIONS:
        SESSIONS[sid] = {"asked_dialogue": [], "deduction_session": None}

    state = SESSIONS[sid]
    answer_text = (request.answer or "").strip()
    choice = normalize_choice(answer_text)

    if choice is not None:
        extracted = []
    else:
        extracted = fallback_extract_symptoms(answer_text)
        if not extracted:
            extracted = await llm_extract_symptoms(answer_text, llm)

    top10: List[Dict[str, Any]] = []
    ded: Dict[str, Any] = {}
    try:
        ded = await call_deduction_service(
            deduction_session_id=state.get("deduction_session"),
            answer_text=answer_text,
            extracted_symptoms=extracted,
            choice=choice,
        )
        if ded.get("sessionId"):
            state["deduction_session"] = ded["sessionId"]

        top10 = ded.get("top10", []) or []
    except Exception as exc:
        logger.warning("Deduction service error: %r", exc)

    if ded.get("end", False):
        top_candidate = _get_top_candidate(ded)
        top_disease = top_candidate.get("disease", "")
        if top_disease:
            explanation = await generate_disease_explanation(
                top_disease,
                top_candidate.get("score", 0),
                ded.get("presentSymptoms", []),
                ded.get("absentSymptoms", []),
                llm,
            )
            if explanation:
                logger.debug("Generated disease explanation for final diagnosis")

    next_q = ded.get("nextQuestionText") if isinstance(ded, dict) else None
    if not next_q:
        next_q = pick_next_question_from_top10(top10, state["asked_dialogue"])

    if choice is not None:
        assistant_note = None
    elif extracted:
        assistant_note = f"Extracted symptoms: {extracted}"
    else:
        assistant_note = "No clear symptoms extracted yet."

    return {
        "sessionId": sid,
        "nextQuestionId": "q_dynamic",
        "nextQuestionText": next_q,
        "quickOptions": settings['dialogue']['default_quick_options'],
        "assistantNote": assistant_note,
        "top10": top10,
    }
