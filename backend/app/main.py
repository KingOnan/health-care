from fastapi import FastAPI

from app.routers import auth

app = FastAPI()

app.include_router(auth.router)


@app.get("/health")
async def health_check() -> dict[str, str]:
    return {"status": "ok"}
