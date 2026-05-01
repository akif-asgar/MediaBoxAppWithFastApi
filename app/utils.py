import os
import random
import string
from datetime import datetime, timedelta
from typing import Optional

from jose import jwt, JWTError
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from starlette.requests import Request
from dotenv import load_dotenv

from app.db import get_async_session
from app.models.user import User

from fastapi_mail import FastMail, MessageSchema, MessageType
from .mail_config import conf

load_dotenv()

# ----------------- CONFIG -----------------
SECRET_KEY = os.getenv("SECRET_KEY")

if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY environment variable is not set!")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  

# ----------------- PASSWORD -----------------
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# ----------------- JWT -----------------
def create_access_token(data: dict, expires_delta: Optional[int] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + timedelta(minutes=expires_delta)
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# ----------------- OAUTH2 SCHEMES -----------------
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

class OptionalOAuth2PasswordBearer(OAuth2PasswordBearer):
    async def __call__(self, request: Request) -> Optional[str]:
        header: str = request.headers.get("Authorization")
        if not header:
            return None
        return await super().__call__(request)

oauth2_scheme_optional = OptionalOAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)

# ----------------- CURRENT USER (REQUIRED) -----------------
# Fix: Depends daxilində session təyin edildiyi üçün startup xətası verməyəcək
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    session: AsyncSession = Depends(get_async_session)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("user_id")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    result = await session.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise credentials_exception
    return user

# ----------------- CURRENT USER (OPTIONAL) -----------------
async def get_current_user_optional(
    token: Optional[str] = Depends(oauth2_scheme_optional),
    session: AsyncSession = Depends(get_async_session)
) -> Optional[User]:
    if not token:
        return None
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("user_id")
        if user_id is None:
            return None
        
        result = await session.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()
    except JWTError:
        return None

# ----------------- VERIFICATION HELPERS -----------------

def generate_verification_code() -> str:
    
    return "".join(random.choices(string.digits, k=6))

async def send_verification_email(email: str, content: str, is_reset: bool = False):
    
    subject = "MediaBox - Şifrə Sıfırlama" if is_reset else "MediaBox - Hesab Təsdiqləmə"
    
    if is_reset:
        
        body = f"""
        <html>
            <body style="font-family: Arial, sans-serif;">
                <h2>Şifrə Sıfırlama Sorğusu</h2>
                <p>Şifrənizi yeniləmək üçün aşağıdakı linkə klikləyin:</p>
                <a href="{content}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                   Şifrəni Sıfırla
                </a>
                <p style="margin-top: 20px; font-size: 0.8em;">Əgər bu düymə işləmirsə, bu linki kopyalayıb brauzerə yapışdırın: {content}</p>
            </body>
        </html>
        """
    else:
        
        body = f"""
        <html>
            <body style="font-family: Arial, sans-serif;">
                <h2>MediaBox Hesab Təsdiqləmə</h2>
                <p>Sizin təsdiq kodunuz: <strong style="font-size: 1.2em; color: #2c3e50;">{content}</strong></p>
                <p>Bu kod qeydiyyatı tamamlamaq üçün lazımdır.</p>
                <hr>
                <p style="font-size: 0.8em; color: #7f8c8d;">Əgər bu sorğunu siz etməmisinizsə, bu emaili silə bilərsiniz.</p>
            </body>
        </html>
        """

    message = MessageSchema(
        subject=subject,
        recipients=[email],
        body=body,
        subtype=MessageType.html
    )

    fm = FastMail(conf)
    await fm.send_message(message)