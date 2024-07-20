from datetime import datetime, timezone
from config.database import chats_collection, users_collection, web_content_vectors_collection
from langchain.agents import tool
from openai import OpenAI
from langchain_mongodb import MongoDBAtlasVectorSearch
from langchain_openai import OpenAIEmbeddings
from langchain_core.documents import Document
from fastapi.responses import StreamingResponse

class Manager(object):
    def __init__(self, user_id, chat_id, openai_api_key: str) -> None:
        self.user_id = user_id
        self.chat_id = chat_id
        self.chatInteraction = {}
        self.openai_client = OpenAI(api_key=openai_api_key)
        self.vector_store = MongoDBAtlasVectorSearch(
            web_content_vectors_collection, 
            OpenAIEmbeddings(), 
            index_name="web_content_vectors_index"
        )
        self.total_token = 0

    async def save_to_db(self):
        total_tokens = self.total_token

        new_chat_doc = {
            "chatInteractions": self.chatInteraction,
            "total_tokens": total_tokens,
            "createdAt": datetime.now(tz=timezone.utc)
        }

        try:
            existing_doc = await chats_collection.find_one({"uid": self.user_id})

            if existing_doc:
                print("Existing Doc")
                session_exists = any(chatSession["chatId"] == self.chat_id for chatSession in existing_doc["chats"])

                print("session exists")
                
                if session_exists:
                    # Update existing session
                    await chats_collection.update_one(
                        {"uid": self.user_id, "chats.chatId": self.chat_id},
                        {"$push": {"chats.$.interactions": new_chat_doc}}
                    )
                else:
                    # Create a new session entry 
                    await chats_collection.update_one(
                        {"uid": self.user_id},
                        {"$push": {"chats": {"chatId": self.chat_id, "interactions": [new_chat_doc]}}}
                    )
            else:
                print("New Doc")
                new_doc = {
                    "uid": self.user_id,
                    "chats": [
                        {
                            "chatid": self.chat_id,
                            "interactions": [new_chat_doc]
                        }
                    ]
                }
                await chats_collection.insert_one(new_doc)
        except Exception as e:
            print(f"Failed to update the DB: {e}") 

    def search_documents(self, query: str):
        """Searches through the uploaded vectorised documents for relevant information."""
        try:
            results = self.vector_store.similarity_search(query, k=2) 

            documents = [Document(page_content=doc.page_content) for doc in results]
            return documents
        except Exception as e:
            return f"Error searching documents: {e}"
        
    async def stream_response(self, response):
        for chunk in response:
            yield f"event: ai\ndata: {chunk.choices[0].delta.content}\n\n"

    async def run_flow(self, input: str):
        self.chatInteraction["user"] = input
        context = self.search_documents(input)
        if context:
            context_str = "\n".join([doc.page_content for doc in context])
            prompt = f"""You are expert at Marvel and DC Comics. Please answer the following question based on the provided context: 
            {context_str}
            Question: {input}

            gives me the response in proper markdown format and leave new line(\n) if needed.
            """
        else:
            prompt = f"""You are expert at Marvel and DC Comics. Please answer the following question based on your knowledge:
            Question: {input}

            gives me the response in proper markdown format and leave new line(\n) if needed.
            """

        response = self.openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful AI assistant, and you are expert at Marvel and DC Comics."},
                {"role": "user", "content": prompt},
            ],
            stream=True,
        )

        async def response_generator():
            full_response = []
            async for chunk in self.stream_response(response):
                yield chunk
                if chunk.startswith("event: ai\ndata:"):
                    content = chunk.split("data: ")[1].strip()
                    full_response.append(content)

            self.chatInteraction["ai"] = " ".join(full_response).strip()
            self.total_token = response.usage.total_tokens if hasattr(response, 'usage') else 0
            await self.save_to_db()

        return StreamingResponse(response_generator(), media_type="text/event-stream")