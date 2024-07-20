from fastapi import APIRouter, Body, Response, HTTPException
from fastapi.encoders import jsonable_encoder
from controller.userController import register_User, fetch_user_by_uid, fetch_all_users, configure_key
from models.userModel import userSchema, llmKeySchema
from fastapi import status
import time
import traceback

router = APIRouter()

@router.post("/register/user", response_description="Registering a new user", status_code=status.HTTP_200_OK)
async def registerUser(
    response: Response,
    user_desc: userSchema = Body(...)
):
    start_time = time.perf_counter()
    try:
        user_data = jsonable_encoder(user_desc)
        user_registered = await register_User(user_data)
        end_time = time.perf_counter()
        elapsed_time = end_time - start_time
        response.headers["X-time"] = str(elapsed_time)
        return user_registered

    except Exception as e:
        end_time = time.perf_counter()
        elapsed = end_time - start_time
        response.headers["X-time"] = str(elapsed)

        msg = traceback.format_exc()
        err = {'err_msg': str(e), 'traceback': msg}
        response.status_code = 500
        response.headers["X-error"] = str(err)

@router.post("/user/configure/llm/key", response_description="Configuring LLMs API Key", status_code=status.HTTP_200_OK)
async def setupKey(
    response: Response,
    key_info: llmKeySchema = Body(...),
):
    start_time = time.perf_counter()
    try:
        key_registered = await configure_key(key_info)
        end_time = time.perf_counter()
        elapsed_time = end_time - start_time
        response.headers["X-time"] = str(elapsed_time)
        return key_registered

    except Exception as e:
        end_time = time.perf_counter()
        elapsed = end_time - start_time
        response.headers["X-time"] = str(elapsed)

        msg = traceback.format_exc()
        err = {'err_msg': str(e), 'traceback': msg}
        response.status_code = 500
        response.headers["X-error"] = str(err)

@router.get("/fetch/user/details", response_description="Fetching User details by thier UID", status_code=status.HTTP_200_OK)
async def fetchUserByUID(
    uid: str,
    response: Response,
):
    start_time = time.perf_counter()
    try:
        user_details = await fetch_user_by_uid(uid)
        if not user_details:
            add_user = {}
            add_user["status"] = "failure"
            add_user["message"] = "User does not exist"
            response.status_code = 404
            return add_user 
        end_time = time.perf_counter()
        elapsed_time = end_time - start_time
        response.headers["X-time"] = str(elapsed_time)
        return user_details

    except Exception as e:
        end_time = time.perf_counter()
        elapsed = end_time - start_time
        response.headers["X-time"] = str(elapsed)

        msg = traceback.format_exc()
        err = {'err_msg': str(e), 'traceback': msg}
        response.status_code = 500
        response.headers["X-error"] = str(err)

        return err
    
@router.get("/fetch/all/user", response_description="Fetching the details of all users", status_code=status.HTTP_200_OK)
async def fetchAllUsers(
    response: Response,
):
    start_time = time.perf_counter()
    try:
        user_details = await fetch_all_users()
        end_time = time.perf_counter()
        elapsed_time = end_time - start_time
        response.headers["X-time"] = str(elapsed_time)
        return user_details

    except Exception as e:
        end_time = time.perf_counter()
        elapsed = end_time - start_time
        response.headers["X-time"] = str(elapsed)

        msg = traceback.format_exc()
        err = {'err_msg': str(e), 'traceback': msg}
        response.status_code = 500
        response.headers["X-error"] = str(err)

        return err