from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.database import engine, Base
from src.routers.expenses import router as expenses_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Money Journey API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(expenses_router)


@app.get("/")
def read_root():
    return {"message": "Money Journey API"}
