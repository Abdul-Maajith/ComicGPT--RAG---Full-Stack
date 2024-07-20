from fastapi import APIRouter, Body, Response, HTTPException
from fastapi.encoders import jsonable_encoder
from controller.chatController import chat_with_llm, get_all_chat_sessions, get_chat_session_interaction, delete_chat_session_interaction
from models.chatModel import chatSchema
from fastapi import status
import time
import traceback

router = APIRouter()

@router.post("/chat", response_description="Chat with an LLM")
async def chatWithLLM(
    response: Response,
    chat_desc: chatSchema = Body(...),
):
    start_time = time.perf_counter()
    try:
        agent_data = jsonable_encoder(chat_desc)
        chatResponse = await chat_with_llm(agent_data)
        end_time = time.perf_counter()
        elapsed_time = end_time - start_time
        response.headers["X-time"] = str(elapsed_time)
        return chatResponse

    except Exception as e:
        end_time = time.perf_counter()
        elapsed = end_time - start_time
        response.headers["X-time"] = str(elapsed)

        msg = traceback.format_exc()
        err = {'err_msg': str(e), 'traceback': msg}
        response.status_code = 500
        response.headers["X-error"] = str(err)

        return err
    
@router.get("/chat/sessions", response_description="Get all of the session on an LLM Chats")
async def getAllChatSessions(
    response: Response,
    uid
):
    start_time = time.perf_counter()
    try:
        session_data = await get_all_chat_sessions(uid)
        end_time = time.perf_counter()
        elapsed_time = end_time - start_time
        response.headers["X-time"] = str(elapsed_time)
        return session_data 

    except Exception as e:
        end_time = time.perf_counter()
        elapsed = end_time - start_time
        response.headers["X-time"] = str(elapsed)

        msg = traceback.format_exc()
        err = {'err_msg': str(e), 'traceback': msg}
        response.status_code = 500
        response.headers["X-error"] = str(err)

        return err
    
@router.get("/chat/interactions/{chat_id}", response_description="Get interactions within a specific session of a chat")
async def get_session_interactions(response: Response, chat_id: str, user_id: str):
    start_time = time.perf_counter()
    try:
        session_data = await get_chat_session_interaction(user_id, chat_id)
        end_time = time.perf_counter()
        elapsed_time = end_time - start_time
        response.headers["X-time"] = str(elapsed_time)
        return session_data

    except Exception as e:
        end_time = time.perf_counter()
        elapsed = end_time - start_time
        response.headers["X-time"] = str(elapsed)

        msg = traceback.format_exc()
        err = {'err_msg': str(e), 'traceback': msg}
        response.status_code = 500
        response.headers["X-error"] = str(err)

        return err
    
@router.delete("/delete/chat/sessions/{chat_id}", response_description="Deleting chat session")
async def delete_session_interactions(response: Response, chat_id: str, user_id: str):
    start_time = time.perf_counter()
    try:
        data = await delete_chat_session_interaction(user_id,chat_id)
        end_time = time.perf_counter()
        elapsed_time = end_time - start_time
        response.headers["X-time"] = str(elapsed_time)
        return data

    except Exception as e:
        end_time = time.perf_counter()
        elapsed = end_time - start_time
        response.headers["X-time"] = str(elapsed)

        msg = traceback.format_exc()
        err = {'err_msg': str(e), 'traceback': msg}
        response.status_code = 500
        response.headers["X-error"] = str(err)

        return err