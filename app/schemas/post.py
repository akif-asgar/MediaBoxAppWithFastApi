from pydantic import BaseModel, ConfigDict
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
    likes_count: int
    liked: bool

    # Fix: Use Pydantic V2 syntax for ORM/Attribute mapping
    model_config = ConfigDict(from_attributes=True)

class PostOut(BaseModel):
    id: int
    title: str
    content: str
    image: Optional[str] = None
    created_at: datetime
    likes_count: int
    liked: bool

    # Fix: Use Pydantic V2 syntax for ORM/Attribute mapping
    model_config = ConfigDict(from_attributes=True)