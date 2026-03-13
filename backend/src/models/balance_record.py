from sqlalchemy import Column, Integer, Float, Date, ForeignKey
from sqlalchemy.orm import relationship

from src.database import Base


class BalanceRecord(Base):
    __tablename__ = "balance_records"

    id = Column(Integer, primary_key=True, index=True)
    bank_id = Column(Integer, ForeignKey("banks.id"), nullable=False)
    date = Column(Date, nullable=False)
    account_balance = Column(Float, default=0.0)
    credit_card_current = Column(Float, default=0.0)
    credit_card_month_1 = Column(Float, default=0.0)
    credit_card_month_2 = Column(Float, default=0.0)
    credit_card_month_3 = Column(Float, default=0.0)
    credit_card_month_4 = Column(Float, default=0.0)
    credit_card_month_5 = Column(Float, default=0.0)
    credit_card_month_6 = Column(Float, default=0.0)
    investments = Column(Float, default=0.0)

    bank = relationship("Bank", back_populates="balance_records")
