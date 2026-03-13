from fastapi import APIRouter

router = APIRouter(prefix="/api", tags=["health"])


@router.get("/health")
def health_check():
    return {"status": "ok", "message": "Money Journey API is running."}


@router.get("/hello")
def hello():
    return {"message": "Ola do Backend em Python! O Money Journey comecou."}
