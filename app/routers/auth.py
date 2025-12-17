from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db import get_async_session
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserOut, UserUpdate
from app.utils import hash_password, verify_password, create_access_token, get_current_user

import shutil
import os

router = APIRouter(prefix="/auth", tags=["auth"])

# ---------------------------- REGISTER ----------------------------
@router.post("/register", response_model=UserOut)
async def register_user(data: UserCreate, session: AsyncSession = Depends(get_async_session)):
    query = select(User).where((User.email == data.email) | (User.username == data.username))
    result = await session.execute(query)
    existing_user = result.scalar_one_or_none()

    if existing_user:
        raise HTTPException(status_code=400, detail="Email və ya Username artıq mövcuddur")

    new_user = User(
        username=data.username,
        email=data.email,
        password=hash_password(data.password)
    )

    session.add(new_user)
    await session.commit()
    await session.refresh(new_user)

    return new_user

# ---------------------------- LOGIN ----------------------------
@router.post("/login")
async def login_user(data: UserLogin, session: AsyncSession = Depends(get_async_session)):
    query = select(User).where(User.email == data.email)
    result = await session.execute(query)
    user = result.scalar_one_or_none()

    if not user or not verify_password(data.password, user.password):
        raise HTTPException(status_code=400, detail="Email və ya şifrə səhvdir")

    access_token = create_access_token({"user_id": user.id})
    return {"access_token": access_token, "token_type": "bearer"}

# ---------------------------- LOGOUT ----------------------------
@router.post("/logout")
async def logout():
    return {"message": "Logged out successfully"}


UPLOAD_DIR = "uploads/profile"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# ---------------------------- GET PROFILE ----------------------------
@router.get("/profile", response_model=UserOut)
async def get_profile(current_user: User = Depends(get_current_user)):
    return current_user


# ---------------------------- UPDATE PROFILE ----------------------------
@router.put("/profile", response_model=UserOut)
async def update_profile(
    data: UserUpdate,
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user)
):
    if data.username:
        current_user.username = data.username
    if data.email:
        current_user.email = data.email
    if data.password:
        current_user.password = hash_password(data.password)

    session.add(current_user)
    await session.commit()
    await session.refresh(current_user)

    return current_user


# ---------------------------- UPLOAD PROFILE PHOTO ----------------------------
@router.post("/profile/photo", response_model=UserOut)
async def upload_profile_photo(
    file: UploadFile = File(...),
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user)
):
    file_location = f"{UPLOAD_DIR}/{current_user.id}_{file.filename}"
    with open(file_location, "wb") as f:
        shutil.copyfileobj(file.file, f)

    current_user.profile_photo = file_location
    session.add(current_user)
    await session.commit()
    await session.refresh(current_user)

    return current_user
