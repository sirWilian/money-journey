from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from src.database import get_db
from src.models.balance_record import BalanceRecord
from src.models.bank import Bank
from src.schemas.balance_record import BalanceRecordCreate, BalanceRecordResponse

router = APIRouter(prefix="/api/balance-records", tags=["balance-records"])


@router.get("/", response_model=list[BalanceRecordResponse])
def list_balance_records(bank_id: int | None = None, db: Session = Depends(get_db)):
    query = db.query(BalanceRecord)
    if bank_id:
        query = query.filter(BalanceRecord.bank_id == bank_id)
    return query.order_by(BalanceRecord.date.desc()).all()


@router.post("/", response_model=BalanceRecordResponse, status_code=201)
def create_balance_record(payload: BalanceRecordCreate, db: Session = Depends(get_db)):
    bank = db.query(Bank).filter(Bank.id == payload.bank_id).first()
    if not bank:
        raise HTTPException(status_code=404, detail="Bank not found")
    record = BalanceRecord(**payload.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.delete("/{record_id}", status_code=204)
def delete_balance_record(record_id: int, db: Session = Depends(get_db)):
    record = db.query(BalanceRecord).filter(BalanceRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    db.delete(record)
    db.commit()
