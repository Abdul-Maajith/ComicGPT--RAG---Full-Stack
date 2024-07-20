from pydantic import BaseModel, Field

class chatSchema(BaseModel):
    uid: str = Field(...)
    userInput: str = Field(...)
    chatId: str = Field(...)