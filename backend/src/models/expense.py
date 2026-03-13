from sqlalchemy import Column, ForeignKey, Integer, String, Float, Date
from sqlalchemy.orm import relationship

from src.database import Base


class ExpenseCategory(Base):
    __tablename__ = "expense_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)

    expenses = relationship("Expense", back_populates="category", cascade="all, delete-orphan")


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    description = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    expense_type = Column(String, nullable=False)  # "fixed" or "variable"
    category_id = Column(Integer, ForeignKey("expense_categories.id"), nullable=False)
    date = Column(Date, nullable=False)

    category = relationship("ExpenseCategory", back_populates="expenses")
