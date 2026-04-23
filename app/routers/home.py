from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import joinedload

from app.db import get_async_session
from app.models.post import Post
from app.models.like import Like
from app.models.user import User
from app.utils import get_current_user

router = APIRouter()


@router.get("/home")
async def get_home(
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user)
):

    result = await db.execute(
        select(Post)
        .options(joinedload(Post.author))   # 🔥 IMPORTANT FIX
        .order_by(Post.created_at.desc())
    )

    posts = result.scalars().all()

    response = []

    for post in posts:

        like_result = await db.execute(
            select(func.count(Like.id)).where(Like.post_id == post.id)
        )
        likes_count = like_result.scalar() or 0

        liked_result = await db.execute(
            select(Like).where(
                Like.post_id == post.id,
                Like.user_id == current_user.id
            )
        )
        liked = liked_result.scalar_one_or_none() is not None

        response.append({
            "id": post.id,
            "title": post.title,
            "content": post.content,
            "image": post.image,

            "author": {
                "id": post.author.id if post.author else None,
                "username": post.author.username if post.author else "Unknown"
            },

            "likes_count": likes_count,
            "liked": liked,

            "created_at": post.created_at,
            "updated_at": post.updated_at
        })

    return response