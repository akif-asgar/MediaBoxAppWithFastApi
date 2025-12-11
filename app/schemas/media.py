from pydantic import BaseModel

class MediaBase(BaseModel):
    file_type: str

class MediaCreate(MediaBase):
    post_id: int

class Media(MediaBase):
    id: int
    file_path: str
    owner_id: int

    class Config:
        orm_mode = True
