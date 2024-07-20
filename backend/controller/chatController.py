from config.database import chats_collection, users_collection
from dotenv import load_dotenv
from fastapi import HTTPException
from core.service import Manager
from decouple import config
from dotenv import load_dotenv

load_dotenv()

async def chat_with_llm(chat_data: dict) -> dict:
    user_data = await users_collection.find_one({"uid": chat_data["uid"]})
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")
    
    openai_api_key = user_data['api_key']['key']

    if not openai_api_key:
        openai_api_key = config('OPENAI_KEY')
    
    manager = Manager(
        user_id=chat_data["uid"], 
        chat_id=chat_data["chatId"],
        openai_api_key=openai_api_key
    )

    return await manager.run_flow(input=chat_data["userInput"])

async def get_all_chat_sessions(user_id: str):
    user_data = await users_collection.find_one({"uid": user_id})
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")
    
    session_data = await chats_collection.find({"uid": user_id}).sort("createdAt", -1).to_list(None) 
    
    if not session_data:
        return [] 
    
    chats_list = []
    for session in session_data:
        session['_id'] = str(session['_id'])
        for chat in session['chats']:
            user_query = chat['interactions'][0]['chatInteractions']['user']
            
            chat_object = {
                "id": chat['chatId'],
                "user_query": user_query,
                "createdAt": chat['interactions'][0]['createdAt'] 
            }
            chats_list.append(chat_object)
        
    chats_list.sort(key=lambda chat: chat['createdAt'], reverse=True)

    return chats_list

async def get_chat_session_interaction(user_id: str, chat_id: str):
    user_data = await users_collection.find_one({"uid": user_id})
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")

    chat_session_data = await chats_collection.find_one({"uid": user_id, "chats.chatId": chat_id})
    if not chat_session_data:
        return []

    interactions = []
    for chat in chat_session_data['chats']:
        if chat['chatId'] == chat_id:
            interactions = chat['interactions']
            break 

    return interactions

async def delete_chat_session_interaction(user_id: str, chat_id: str):
    try:
        user_doc = await chats_collection.find_one({"uid": user_id})
        
        if not user_doc:
            raise HTTPException(status_code=404, detail="User not found")
        
        updated_chats = [chat for chat in user_doc['chats'] if chat['chatId'] != chat_id]
        
        if len(updated_chats) == len(user_doc['chats']):
            raise HTTPException(status_code=404, detail="Chat session not found")
        
        update_result = await chats_collection.update_one(
            {"uid": user_id},
            {"$set": {"chats": updated_chats}}
        )
        
        if update_result.modified_count == 0:
            raise HTTPException(status_code=500, detail="Failed to delete session")
    
        return {
            "message": f"Session with Id: {chat_id} successfully deleted"
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")