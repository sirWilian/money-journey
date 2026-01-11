from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "API do Money Journey rodando!"}

@app.get("/api/chart-data")
def get_chart_data():
    return [
        {"month": "Jan", "balance": 4000},
        {"month": "Feb", "balance": 5000},
        {"month": "Mar", "balance": 6400},
    ]