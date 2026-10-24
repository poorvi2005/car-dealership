"""
Pydantic schemas = the shape of data going IN to and OUT of the API.

Keeping these separate from the ORM models means we control exactly what the
outside world sees (e.g. `hashed_password` is never in any response schema).
"""
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

VEHICLE_CATEGORIES = ("Sedan", "SUV", "Hatchback", "Coupe", "Truck", "Electric", "Convertible")


# ---------- Auth ----------
class RegisterRequest(BaseModel):
    email: EmailStr
    full_name: str = Field(min_length=2, max_length=120)
    password: str = Field(min_length=8, max_length=72)  # bcrypt only uses the first 72 bytes

    @field_validator("email")
    @classmethod
    def lowercase_email(cls, v: str) -> str:
        return v.lower()

    @field_validator("full_name")
    @classmethod
    def strip_name(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 2:
            raise ValueError("Name is too short")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str

    @field_validator("email")
    @classmethod
    def lowercase_email(cls, v: str) -> str:
        return v.lower()


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    full_name: str
    is_admin: bool


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ---------- Vehicles ----------
class VehicleBase(BaseModel):
    make: str = Field(min_length=1, max_length=60)
    model: str = Field(min_length=1, max_length=80)
    category: str
    price: Decimal = Field(ge=0, max_digits=12, decimal_places=2)
    quantity: int = Field(ge=0)
    year: int | None = Field(default=None, ge=1900, le=2100)
    color: str | None = Field(default=None, max_length=40)

    @field_validator("category")
    @classmethod
    def valid_category(cls, v: str) -> str:
        # Accept any casing from the client, store the canonical spelling.
        for c in VEHICLE_CATEGORIES:
            if c.lower() == v.strip().lower():
                return c
        raise ValueError(f"category must be one of {', '.join(VEHICLE_CATEGORIES)}")


class VehicleCreate(VehicleBase):
    pass


class VehicleUpdate(BaseModel):
    """Every field optional: the client sends only what it wants to change."""

    make: str | None = Field(default=None, min_length=1, max_length=60)
    model: str | None = Field(default=None, min_length=1, max_length=80)
    category: str | None = None
    price: Decimal | None = Field(default=None, ge=0, max_digits=12, decimal_places=2)
    quantity: int | None = Field(default=None, ge=0)
    year: int | None = Field(default=None, ge=1900, le=2100)
    color: str | None = Field(default=None, max_length=40)

    @field_validator("category")
    @classmethod
    def valid_category(cls, v: str | None) -> str | None:
        return None if v is None else VehicleBase.valid_category(v)


class VehicleOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    make: str
    model: str
    category: str
    price: float
    quantity: int
    year: int | None
    color: str | None


class StockChange(BaseModel):
    quantity: int = Field(default=1, gt=0, le=1000)
