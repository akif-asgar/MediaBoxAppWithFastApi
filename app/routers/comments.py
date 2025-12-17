from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db import get_async_session
from app.models.comment import Comment
from app.models.post import Post
from app.schemas.comment import CommentCreate, CommentOut
from app.utils import get_current_user
from app.models.user import User

router = APIRouter(prefix="/comments", tags=["Comments"])


# ---------------------------- CREATE COMMENT ----------------------------
@router.post(
    "/posts/{post_id}",
    response_model=CommentOut,
    status_code=status.HTTP_201_CREATED
)
async def create_comment(
    post_id: int,
    comment_in: CommentCreate,
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user),
):
    result = await session.execute(
        select(Post).where(Post.id == post_id)
    )
    post = result.scalar_one_or_none()

    if not post:
        raise HTTPException(status_code=404, detail="Post tapılmadı")

    comment = Comment(
        content=comment_in.content,
        user_id=current_user.id,
        post_id=post_id,
    )

    session.add(comment)
    await session.commit()
    await session.refresh(comment)

    return comment

# ---------------------------- GET COMMENTS FOR A POST ----------------------------

@router.get(
    "/posts/{post_id}",
    response_model=list[CommentOut]
)
async def get_comments_for_post(
    post_id: int,
    session: AsyncSession = Depends(get_async_session),
):
    result = await session.execute(
        select(Comment).where(Comment.post_id == post_id)
    )
    return result.scalars().all()

# ---------------------------- DELETE COMMENT ----------------------------

@router.delete("/{comment_id}", status_code=204)
async def delete_comment(
    comment_id: int,
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user),
):
    result = await session.execute(
        select(Comment).where(Comment.id == comment_id)
    )
    comment = result.scalar_one_or_none()

    if not comment:
        raise HTTPException(status_code=404, detail="Comment tapılmadı")

    if comment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="İcazə yoxdur")

    await session.delete(comment)
    await session.commit()

