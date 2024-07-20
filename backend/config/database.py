import motor.motor_asyncio
from bson.objectid import ObjectId
from decouple import config
from dotenv import load_dotenv
from pymongo import MongoClient
import os

load_dotenv()

pyMongoClient = MongoClient(config('MONGODB_URI'))
MONGO_DETAILS = config('MONGODB_URI')
client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_DETAILS)

DATABASE_NAME = config('DATABASE_NAME')
database = client[DATABASE_NAME]

users_collection = database.get_collection("users") 
chats_collection = database.get_collection("chats")
# web_content_collection = database.get_collection("webContents")

web_content_vectors_collection = pyMongoClient.get_database(DATABASE_NAME).get_collection("web_content_vectors")
