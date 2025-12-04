from fastapi import FastAPI
from app.db import engine, Base
from app.routers.auth import router as auth_router

app = FastAPI()

app.include_router(auth_router)
@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


@app.get("/")
async def root():
    return {"message": "MediaBox API is running"}
