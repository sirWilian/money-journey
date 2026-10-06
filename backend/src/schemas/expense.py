from pydantic import BaseModel
from datetime import datetime


class ExpenseBase(BaseModel):
    name: str
    category: str
    amount: float
    is_income: bool = False


class ExpenseCreate(ExpenseBase):
    pass


class ExpenseRead(ExpenseBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}
