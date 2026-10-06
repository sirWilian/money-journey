from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.expense import Expense
from ..schemas.expense import ExpenseCreate, ExpenseRead

router = APIRouter(prefix="/api/expenses", tags=["expenses"])


@router.get("/", response_model=List[ExpenseRead])
def list_expenses(db: Session = Depends(get_db)):
    return db.query(Expense).order_by(Expense.created_at.desc()).limit(10).all()


@router.post("/", response_model=ExpenseRead, status_code=201)
def create_expense(expense: ExpenseCreate, db: Session = Depends(get_db)):
    db_expense = Expense(**expense.model_dump())
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return db_expense
