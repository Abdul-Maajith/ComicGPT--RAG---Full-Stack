from config.database import users_collection, web_content_vectors_collection
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_mongodb import MongoDBAtlasVectorSearch
from fastapi import HTTPException
from core.scraper import UniversalWebScraper
from decouple import config
from dotenv import load_dotenv

load_dotenv()

async def vectorise_web_content(user_id):
    try:
        user_data = await users_collection.find_one({"uid": user_id})
        if not user_data:
            raise HTTPException(status_code=404, detail="User not found")

        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000, 
            chunk_overlap=150, 
            length_function=len,
        )

        user_data = await users_collection.find_one({"uid": user_id})
        if user_data:
            openai_api_key = user_data['api_key']['key']

        if not openai_api_key:
           openai_api_key = config('OPENAI_KEY')
    
        scraper = UniversalWebScraper(openai_api_key)
        marvel_result, dc_result = scraper.run()
        combined_markdown = f"{marvel_result}\n\n{dc_result}"
        
        texts = text_splitter.create_documents([combined_markdown])
        docs = text_splitter.split_documents(
            texts
        )

        for doc in docs:
            doc.metadata = {"user_id": user_id}

        MongoDBAtlasVectorSearch.from_documents(
            documents=docs,
            embedding=OpenAIEmbeddings(disallowed_special=()),
            collection=web_content_vectors_collection,
            index_name="web_content_vectors_index",
        )

        return {
            "message": "Content successfully vectorised",
            "status": "Success",
        }
    except Exception as e:
        return {
            "message": "Failed to vectorise the document",
            "status": "Error",
            "error": str(e)
        }