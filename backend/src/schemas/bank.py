from pydantic import BaseModel


class BankCreate(BaseModel):
    name: str
    color: str = "#4CAF50"


class BankResponse(BaseModel):
    id: int
    name: str
    color: str

    model_config = {"from_attributes": True}
