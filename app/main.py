from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db import engine, Base
from app.routers.auth import router as auth_router
from app.routers.posts import router as posts_router
from app.routers.comments import router as comments_router
from fastapi.staticfiles import StaticFiles
from app.routers import likes, posts

app = FastAPI()
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router)
app.include_router(posts_router)
app.include_router(comments_router)
app.include_router(likes.router)

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@app.get("/")
async def root():
    return {"message": "MediaBox API is running"}
