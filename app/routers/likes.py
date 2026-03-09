from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db import get_async_session
from app.models.like import Like
from app.models.post import Post
from app.utils import get_current_user
from app.models.user import User

router = APIRouter(prefix="/likes", tags=["likes"])

@router.post("/posts/{post_id}")
async def toggle_like(
    post_id: int,
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user)
):
    # 1. Postun mövcudluğunu yoxla
    result = await db.execute(select(Post).where(Post.id == post_id))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    # 2. Mövcud like varsa sil, yoxdursa əlavə et
    result = await db.execute(
        select(Like).where(Like.post_id == post_id, Like.user_id == current_user.id)
    )
    like = result.scalar_one_or_none()

    if like:
        await db.delete(like)
    else:
        new_like = Like(post_id=post_id, user_id=current_user.id)
        db.add(new_like)

    # 3. **Commit** vacibdir!
    await db.commit()

    # 4. Yeni like sayını hesabla
    result = await db.execute(
        select(Like).where(Like.post_id == post_id)
    )
    likes_count = len(result.scalars().all())

    return {"liked": not bool(like), "likes_count": likes_count}