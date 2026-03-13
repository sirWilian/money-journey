from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from src.database import get_db
from src.models.bank import Bank
from src.schemas.bank import BankCreate, BankResponse

router = APIRouter(prefix="/api/banks", tags=["banks"])


@router.get("/", response_model=list[BankResponse])
def list_banks(db: Session = Depends(get_db)):
    return db.query(Bank).all()


@router.post("/", response_model=BankResponse, status_code=201)
def create_bank(payload: BankCreate, db: Session = Depends(get_db)):
    bank = Bank(**payload.model_dump())
    db.add(bank)
    db.commit()
    db.refresh(bank)
    return bank


@router.put("/{bank_id}", response_model=BankResponse)
def update_bank(bank_id: int, payload: BankCreate, db: Session = Depends(get_db)):
    bank = db.query(Bank).filter(Bank.id == bank_id).first()
    if not bank:
        raise HTTPException(status_code=404, detail="Bank not found")
    for key, value in payload.model_dump().items():
        setattr(bank, key, value)
    db.commit()
    db.refresh(bank)
    return bank


@router.delete("/{bank_id}", status_code=204)
def delete_bank(bank_id: int, db: Session = Depends(get_db)):
    bank = db.query(Bank).filter(Bank.id == bank_id).first()
    if not bank:
        raise HTTPException(status_code=404, detail="Bank not found")
    db.delete(bank)
    db.commit()
