from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from src.database import get_db
from src.models.expense import Expense, ExpenseCategory
from src.schemas.expense import (
    ExpenseCategoryCreate,
    ExpenseCategoryResponse,
    ExpenseCreate,
    ExpenseResponse,
)

router = APIRouter(prefix="/api/expenses", tags=["expenses"])


# --- Categories ---

@router.get("/categories", response_model=list[ExpenseCategoryResponse])
def list_categories(db: Session = Depends(get_db)):
    return db.query(ExpenseCategory).all()


@router.post("/categories", response_model=ExpenseCategoryResponse, status_code=201)
def create_category(payload: ExpenseCategoryCreate, db: Session = Depends(get_db)):
    existing = db.query(ExpenseCategory).filter(ExpenseCategory.name == payload.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Category already exists")
    category = ExpenseCategory(**payload.model_dump())
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.delete("/categories/{category_id}", status_code=204)
def delete_category(category_id: int, db: Session = Depends(get_db)):
    category = db.query(ExpenseCategory).filter(ExpenseCategory.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    db.delete(category)
    db.commit()


# --- Expenses ---

@router.get("/", response_model=list[ExpenseResponse])
def list_expenses(expense_type: str | None = None, db: Session = Depends(get_db)):
    query = db.query(Expense)
    if expense_type:
        query = query.filter(Expense.expense_type == expense_type)
    return query.order_by(Expense.date.desc()).all()


@router.post("/", response_model=ExpenseResponse, status_code=201)
def create_expense(payload: ExpenseCreate, db: Session = Depends(get_db)):
    category = db.query(ExpenseCategory).filter(ExpenseCategory.id == payload.category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    expense = Expense(**payload.model_dump())
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense


@router.delete("/{expense_id}", status_code=204)
def delete_expense(expense_id: int, db: Session = Depends(get_db)):
    expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    db.delete(expense)
    db.commit()
