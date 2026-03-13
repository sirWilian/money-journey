from datetime import date

from pydantic import BaseModel


class ExpenseCategoryCreate(BaseModel):
    name: str


class ExpenseCategoryResponse(BaseModel):
    id: int
    name: str

    model_config = {"from_attributes": True}


class ExpenseCreate(BaseModel):
    description: str
    amount: float
    expense_type: str  # "fixed" or "variable"
    category_id: int
    date: date


class ExpenseResponse(BaseModel):
    id: int
    description: str
    amount: float
    expense_type: str
    category_id: int
    date: date
    category: ExpenseCategoryResponse

    model_config = {"from_attributes": True}
