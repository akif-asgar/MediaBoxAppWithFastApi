import os
import shutil
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi.security import OAuth2PasswordRequestForm

from app.db import get_async_session
from app.models.user import User
from app.schemas.user import UserCreate, UserOut, UserUpdate
from app.utils import (
    hash_password, verify_password, create_access_token, 
    get_current_user, generate_verification_code, send_verification_email,
    oauth2_scheme
)

router = APIRouter(prefix="/auth", tags=["auth"])

# ---------------------------- REGISTER & VERIFY ----------------------------

@router.post("/register", response_model=UserOut)
async def register_user(data: UserCreate, session: AsyncSession = Depends(get_async_session)):
    query = select(User).where((User.email == data.email) | (User.username == data.username))
    result = await session.execute(query)
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email və ya Username artıq mövcuddur")

    v_code = generate_verification_code()
    new_user = User(
        username=data.username,
        email=data.email,
        password=hash_password(data.password),
        verification_code=v_code,
        is_verified=False
    )
    session.add(new_user)
    await session.commit()
    await session.refresh(new_user)

    
    await send_verification_email(new_user.email, v_code, is_reset=False)
    return new_user

@router.post("/verify-email")
async def verify_email(email: str, code: str, session: AsyncSession = Depends(get_async_session)):
    query = select(User).where(User.email == email, User.verification_code == code)
    result = await session.execute(query)
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=400, detail="Kod yanlışdır və ya istifadəçi tapılmadı")
    
    user.is_verified = True
    user.verification_code = None
    await session.commit()
    return {"message": "Email təsdiqləndi"}

# ---------------------------- LOGIN ----------------------------

@router.post("/login")
async def login_user(form_data: OAuth2PasswordRequestForm = Depends(), session: AsyncSession = Depends(get_async_session)):
    
    query = select(User).where(User.email == form_data.username)
    result = await session.execute(query)
    user = result.scalar_one_or_none()

    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(status_code=400, detail="Email və ya şifrə yanlışdır")

    if not user.is_verified:
        raise HTTPException(status_code=401, detail="Hesab təsdiqlənməyib. Zəhmət olmasa emailinizi yoxlayın")

    token = create_access_token({"user_id": str(user.id)})
    return {"access_token": token, "token_type": "bearer"}

# ---------------------------- PROFILE ROUTES ----------------------------

@router.get("/profile", response_model=UserOut)
async def get_profile(current_user: User = Depends(get_current_user)):
    
    return current_user

@router.put("/profile")
async def update_profile(
    data: UserUpdate, 
    current_user: User = Depends(get_current_user), 
    session: AsyncSession = Depends(get_async_session)
):
    current_user.username = data.username
    current_user.email = data.email
    if data.password:
        current_user.password = hash_password(data.password)
    
    await session.commit()
    return {"message": "Profil yeniləndi"}

@router.post("/profile/photo")
async def upload_photo(
    file: UploadFile = File(...), 
    current_user: User = Depends(get_current_user), 
    session: AsyncSession = Depends(get_async_session)
):
    os.makedirs("uploads", exist_ok=True)
    
    file_extension = file.filename.split(".")[-1]
    file_path = f"uploads/{current_user.id}_profile.{file_extension}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    current_user.profile_photo = file_path
    await session.commit()
    return {"path": file_path}

# ---------------------------- PASSWORD RESET ----------------------------

@router.post("/forgot-password")
async def forgot_password(email: str, session: AsyncSession = Depends(get_async_session)):
    query = select(User).where(User.email == email)
    result = await session.execute(query)
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="Bu email ilə qeydiyyatdan keçmiş istifadəçi tapılmadı")

    
    token = create_access_token({"user_id": str(user.id)}, expires_delta=15)
    link = f"http://localhost:5173/reset-password?token={token}"
    
    
    await send_verification_email(user.email, link, is_reset=True)
    return {"message": "Şifrə sıfırlama linki emailinizə göndərildi"}

@router.post("/reset-password")
async def reset_password(
    token: str, 
    new_password: str, 
    session: AsyncSession = Depends(get_async_session)
):
    
    user = await get_current_user(token=token, session=session)
    
    user.password = hash_password(new_password)
    await session.commit()
    return {"message": "Şifrəniz uğurla yeniləndi"}