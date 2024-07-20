from fastapi import APIRouter, Response
import time
import traceback
from controller.contentVectorController import vectorise_web_content

router = APIRouter()

@router.get("/vectorise/webcontent")
async def vectorise_content(user_id: str, response:Response):
    start_time = time.perf_counter()
    try:

        file_info = await vectorise_web_content(user_id)
        end_time = time.perf_counter()
        elapsed_time = end_time - start_time
        response.headers["X-time"] = str(elapsed_time)
        return file_info 
    except Exception as e:
        end_time = time.perf_counter()
        elapsed = end_time - start_time
        response.headers["X-time"] = str(elapsed)

        msg = traceback.format_exc()
        err = {'err_msg': str(e), 'traceback': msg}
        response.status_code = 500
        response.headers["X-error"] = str(err)

        return err