from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.db import get_async_session
from app.models.like import Like
from app.models.post import Post
from app.models.user import User
from app.utils import get_current_user

router = APIRouter(prefix="/likes", tags=["likes"])

@router.post("/posts/{post_id}")
async def toggle_like(
    post_id: int,
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user)
):
    # Check if the post exists
    result = await db.execute(select(Post).where(Post.id == post_id))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    # Check if the current user already liked the post
    result = await db.execute(
        select(Like).where(Like.post_id == post_id, Like.user_id == current_user.id)
    )
    like = result.scalar_one_or_none()

    # Capture intent BEFORE the toggle
    was_liked = like is not None

    if like:
        # Unlike the post if already liked
        await db.delete(like)
    else:
        # Add a new like if not liked yet
        new_like = Like(post_id=post_id, user_id=current_user.id)
        db.add(new_like)

    # Commit changes
    await db.commit()

    # Count total likes for the post
    result = await db.execute(select(func.count(Like.id)).where(Like.post_id == post_id))
    likes_count = result.scalar() or 0

    # Derive new liked status from the pre-toggle state
    liked_now = not was_liked

    return {"liked": liked_now, "likes_count": likes_count}