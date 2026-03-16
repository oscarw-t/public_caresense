"""LLM-related API routes (e.g. symptom-to-question)."""

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from langchain_openai import ChatOpenAI

from src.services.llm_service import get_llm, get_symptom_to_question, get_disease_to_treatment

router = APIRouter(tags=["LLM"])


@router.post("/symptom-to-question")
async def symptom_to_question(symptom: str, llm: ChatOpenAI = Depends(get_llm)):
    question = await get_symptom_to_question(symptom, llm)
    return JSONResponse(
        status_code=200,
        content={"question": question}
    )

@router.post("/disease-to-treatment")
async def disease_to_treatment(disease: str, llm: ChatOpenAI = Depends(get_llm)):
    treatment = await get_disease_to_treatment(disease, llm)
    return JSONResponse(
        status_code=200,
        content={"treatment": treatment}
    )
