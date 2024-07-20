from fastapi import FastAPI, UploadFile, File
from routes.chatRoute import router as ChatRouter 
from routes.userRoute import router as UserRouter 
from routes.fileRoute import router as FileRouter 
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
import os

load_dotenv()

os.environ['OPENAI_API_KEY'] = os.getenv('OPENAI_KEY')

app = FastAPI()

origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ChatRouter, tags=["Chat APIs"], prefix="/api")
app.include_router(UserRouter, tags=["User APIs"], prefix="/api")
app.include_router(FileRouter, tags=["File's APIs"], prefix="/api")

@app.get("/", tags=["Root"])
async def read_root():
    return {"message": "Welcome to ComicGPT API Docs"}

@app.get("/ping", tags=["Root"], status_code=200)
async def read_root():
    return {"message": "ping works!"}