from datetime import date

from pydantic import BaseModel

from src.schemas.bank import BankResponse


class BalanceRecordCreate(BaseModel):
    bank_id: int
    date: date
    account_balance: float = 0.0
    credit_card_current: float = 0.0
    credit_card_month_1: float = 0.0
    credit_card_month_2: float = 0.0
    credit_card_month_3: float = 0.0
    credit_card_month_4: float = 0.0
    credit_card_month_5: float = 0.0
    credit_card_month_6: float = 0.0
    investments: float = 0.0


class BalanceRecordResponse(BaseModel):
    id: int
    bank_id: int
    date: date
    account_balance: float
    credit_card_current: float
    credit_card_month_1: float
    credit_card_month_2: float
    credit_card_month_3: float
    credit_card_month_4: float
    credit_card_month_5: float
    credit_card_month_6: float
    investments: float
    bank: BankResponse

    model_config = {"from_attributes": True}
