from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
import shutil, uuid, os

from app.db import get_async_session
from app.models.post import Post
from app.schemas.post import PostCreate, PostResponse
from app.utils import get_current_user
from app.models.user import User

router = APIRouter(
    prefix="/posts",
    tags=["posts"]
)

# Upload qovluğu
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# ---------------- CREATE POST ----------------
@router.post("/", response_model=PostResponse)
async def create_post(
    title: str = Form(...),
    content: str = Form(...),
    image: UploadFile = File(None),
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user)
):
    image_path = None
    if image:
        ext = image.filename.split(".")[-1]
        filename = f"{uuid.uuid4()}.{ext}"
        image_path = f"{UPLOAD_DIR}/{filename}"
        with open(image_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)

    new_post = Post(
        title=title,
        content=content,
        author_id=current_user.id,
        image=image_path
    )

    db.add(new_post)
    await db.commit()
    await db.refresh(new_post)

    return new_post


# ---------------- GET ALL POSTS ----------------
@router.get("/", response_model=List[PostResponse])
async def get_posts(db: AsyncSession = Depends(get_async_session)):
    result = await db.execute(select(Post))
    return result.scalars().all()


# ---------------- GET SINGLE POST ----------------
@router.get("/{post_id}", response_model=PostResponse)
async def get_post(post_id: int, db: AsyncSession = Depends(get_async_session)):
    result = await db.execute(select(Post).where(Post.id == post_id))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


# ---------------- UPDATE POST ----------------
@router.put("/{post_id}", response_model=PostResponse)
async def update_post(
    post_id: int,
    data: PostCreate,
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Post).where(Post.id == post_id))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    if post.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    post.title = data.title
    post.content = data.content

    await db.commit()
    await db.refresh(post)
    return post


# ---------------- DELETE POST ----------------
@router.delete("/{post_id}")
async def delete_post(
    post_id: int,
    db: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Post).where(Post.id == post_id))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    if post.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    await db.delete(post)
    await db.commit()
    return {"message": "Post deleted"}