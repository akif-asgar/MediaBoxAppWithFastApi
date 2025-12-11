from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.db import get_async_session
from app.models.post import Post
from app.schemas.post import PostCreate, PostResponse
from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
import shutil, uuid

from app.db import get_async_session
from app.models.post import Post


router = APIRouter(
    prefix="/posts",
    tags=["posts"]
)


# CREATE POST
@router.post("/")
async def create_post(
    title: str = Form(...),
    content: str = Form(...),
    author_id: str = Form(...),
    image: UploadFile = File(None),
    db: AsyncSession = Depends(get_async_session)
):
    image_path = None
    if image:
        file_ext = image.filename.split(".")[-1]
        file_name = f"{uuid.uuid4()}.{file_ext}"
        file_path = f"uploads/{file_name}"

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)

        image_path = file_path

    new_post = Post(
        title=title,
        content=content,
        author_id=author_id,
        image=image_path
    )

    db.add(new_post)
    await db.commit()
    await db.refresh(new_post)

    return new_post

# GET ALL POSTS
@router.get("/", response_model=List[PostResponse])
async def get_posts(db: AsyncSession = Depends(get_async_session)):
    result = await db.execute(select(Post))
    return result.scalars().all()


# GET SINGLE POST
@router.get("/{post_id}", response_model=PostResponse)
async def get_post(post_id: int, db: AsyncSession = Depends(get_async_session)):
    result = await db.execute(select(Post).where(Post.id == post_id))
    post = result.scalar_one_or_none()

    if post is None:
        raise HTTPException(status_code=404, detail="Post not found")

    return post


# UPDATE POST
@router.put("/{post_id}", response_model=PostResponse)
async def update_post(
    post_id: int,
    data: PostCreate,
    db: AsyncSession = Depends(get_async_session)
):
    result = await db.execute(select(Post).where(Post.id == post_id))
    post = result.scalar_one_or_none()

    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    post.title = data.title
    post.content = data.content
    post.image = data.image
    post.author_id = data.author_id

    await db.commit()
    await db.refresh(post)

    return post


# DELETE POST
@router.delete("/{post_id}")
async def delete_post(post_id: int, db: AsyncSession = Depends(get_async_session)):
    result = await db.execute(select(Post).where(Post.id == post_id))
    post = result.scalar_one_or_none()

    if post is None:
        raise HTTPException(status_code=404, detail="Post not found")

    await db.delete(post)
    await db.commit()

    return {"message": "Post deleted"}
