from datetime import datetime

from pydantic import BaseModel, Field

class userSchema(BaseModel):
    uid: str = Field(...)
    name: str = Field(...)
    email: str = Field(...)
    photoURL: str = Field(...)
    plan: str | None = None
    createdAt: datetime = Field(default_factory=datetime.now)
    lastLogin: datetime | None = None
    credit_limit: float | None = None

class llmKeySchema(BaseModel):
    uid: str = Field(...)
    key: str = Field(...)
    provider: str = Field(...)