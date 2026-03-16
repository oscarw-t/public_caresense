"""Next-step API routes (process answer, return next question)."""

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from langchain_openai import ChatOpenAI

from src.services.next_handler import handle_next
from src.models.requests import NextRequest
from src.services.llm_service import get_llm

router = APIRouter(tags=["Next"])


@router.post("/next-step")
async def next_step_alias(request: NextRequest, llm: ChatOpenAI = Depends(get_llm)):
    """
    Process the user's answer and return the next question.
    """
    data = await handle_next(request, llm)
    return JSONResponse(status_code=200, content=data)
