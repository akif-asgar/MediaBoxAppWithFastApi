from uuid import UUID
from typing import Optional
from pydantic import BaseModel
from datetime import datetime

class CommentCreate(BaseModel):
    content: str

class CommentOut(BaseModel):
    id: int
    content: str
    username: str
    user_id: UUID         
    post_id: int
    created_at: datetime

    class Config:
        model_config = {"from_attributes": True}