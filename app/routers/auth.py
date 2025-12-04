from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from passlib.context import CryptContext

from app.db import get_async_session
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserOut
from app.core.security import create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# hash password
def hash_password(password: str):
    return pwd_context.hash(password)


# check password
def verify_password(password: str, hashed: str):
    return pwd_context.verify(password, hashed)


# ---------------------------- REGISTER ----------------------------
@router.post("/register", response_model=UserOut)
async def register_user(data: UserCreate, session: AsyncSession = Depends(get_async_session)):

    # email və username yoxlaması
    query = select(User).where(
        (User.email == data.email) | (User.username == data.username)
    )
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
