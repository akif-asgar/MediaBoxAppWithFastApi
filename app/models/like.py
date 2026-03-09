from sqlalchemy import Column, Integer, ForeignKey, UniqueConstraint
from app.db import Base

class Like(Base):
    __tablename__ = "likes"

    id = Column(Integer, primary_key=True)

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    post_id = Column(Integer, ForeignKey("posts.id", ondelete="CASCADE"))

    __table_args__ = (
        UniqueConstraint("user_id", "post_id"),
    )