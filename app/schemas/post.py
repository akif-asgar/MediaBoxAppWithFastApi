from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class PostBase(BaseModel):
    title: str
    content: str
    image: Optional[str] = None


class PostCreate(PostBase):
    author_id: str


class PostResponse(PostBase):
    id: int
    author_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
