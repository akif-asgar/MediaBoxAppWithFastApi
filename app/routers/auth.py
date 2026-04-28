import os
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi.security import OAuth2PasswordRequestForm

from app.db import get_async_session
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserOut, UserUpdate
from app.utils import (
    hash_password, verify_password, create_access_token, 
    get_current_user, generate_verification_code, send_verification_email
)

# Every route here will start with /auth
router = APIRouter(prefix="/auth", tags=["auth"])

# ---------------------------- REGISTER ----------------------------
@router.post("/register", response_model=UserOut)
async def register_user(data: UserCreate, session: AsyncSession = Depends(get_async_session)):
    query = select(User).where((User.email == data.email) | (User.username == data.username))
    result = await session.execute(query)
    existing_user = result.scalar_one_or_none()

    if existing_user:
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

    await send_verification_email(new_user.email, v_code)
    return new_user

# ---------------------------- VERIFY EMAIL ----------------------------
@router.post("/verify-email")
async def verify_email(email: str, code: str, session: AsyncSession = Depends(get_async_session)):
    query = select(User).where(User.email == email, User.verification_code == code)
    result = await session.execute(query)
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=400, detail="Kod yanlışdır və ya istifadəçi tapılmadı.")
    
    user.is_verified = True
    user.verification_code = None
    await session.commit()
    
    return {"message": "Email uğurla təsdiqləndi!"}

# ---------------------------- LOGIN ----------------------------
@router.post("/login")
async def login_user(
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: AsyncSession = Depends(get_async_session)
):
    query = select(User).where(User.email == form_data.username)
    result = await session.execute(query)
    user = result.scalar_one_or_none()

    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(status_code=400, detail="Email və ya şifrə səhvdir")

    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Hesabınız təsdiqlənməyib."
        )

    access_token = create_access_token({"user_id": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer"}

# ---------------------------- PROFILE (GET) ----------------------------
@router.get("/profile", response_model=UserOut)
async def get_profile(current_user: User = Depends(get_current_user)):
    return current_user

# ---------------------------- PROFILE (UPDATE/PUT) ----------------------------
@router.put("/profile")
async def update_profile(
    data: UserUpdate, 
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user)
):
    query = select(User).where(User.id == current_user.id)
    result = await session.execute(query)
    user = result.scalar_one()

    # Update fields
    user.username = data.username
    user.email = data.email
    if data.password:
        user.password = hash_password(data.password)

    await session.commit()
    return {"message": "Profil yeniləndi"}

# ---------------------------- PROFILE PHOTO ----------------------------
@router.post("/profile/photo")
async def upload_profile_photo(
    file: UploadFile = File(...),
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user)
):
    # Ensure uploads directory exists
    os.makedirs("uploads", exist_ok=True)
    
    file_path = f"uploads/{current_user.id}_{file.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Update user in DB
    query = select(User).where(User.id == current_user.id)
    result = await session.execute(query)
    user = result.scalar_one()
    
    user.profile_photo = file_path
    await session.commit()

    return {"info": "Şəkil yükləndi", "path": file_path}