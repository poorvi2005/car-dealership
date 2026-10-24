"""Vehicle catalogue and stock rules."""
from decimal import Decimal

from sqlalchemy import func, select, update
from sqlalchemy.orm import Session

from app.models import Vehicle
from app.schemas import VehicleCreate, VehicleUpdate
from app.services import NotFoundError, OutOfStockError


class VehicleService:
    def __init__(self, db: Session):
        self.db = db

    # ---------- reads ----------
    def list_all(self) -> list[Vehicle]:
        return list(self.db.scalars(select(Vehicle).order_by(Vehicle.id)))

    def get(self, vehicle_id: int) -> Vehicle:
        vehicle = self.db.get(Vehicle, vehicle_id)
        if vehicle is None:
            raise NotFoundError(f"Vehicle {vehicle_id} not found")
        return vehicle

    def search(
        self,
        make: str | None = None,
        model: str | None = None,
        category: str | None = None,
        min_price: Decimal | None = None,
        max_price: Decimal | None = None,
    ) -> list[Vehicle]:
        """Every filter is optional; filters that are given are combined with AND."""
        query = select(Vehicle)
        if make:
            query = query.where(func.lower(Vehicle.make).contains(make.strip().lower()))
        if model:
            query = query.where(func.lower(Vehicle.model).contains(model.strip().lower()))
        if category:
            query = query.where(func.lower(Vehicle.category) == category.strip().lower())
        if min_price is not None:
            query = query.where(Vehicle.price >= min_price)
        if max_price is not None:
            query = query.where(Vehicle.price <= max_price)
        return list(self.db.scalars(query.order_by(Vehicle.price)))

    # ---------- writes ----------
    def create(self, data: VehicleCreate) -> Vehicle:
        vehicle = Vehicle(**data.model_dump())
        self.db.add(vehicle)
        self.db.commit()
        self.db.refresh(vehicle)
        return vehicle

    def update(self, vehicle_id: int, data: VehicleUpdate) -> Vehicle:
        vehicle = self.get(vehicle_id)
        # exclude_unset: only touch the fields the client actually sent (partial update).
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(vehicle, field, value)
        self.db.commit()
        self.db.refresh(vehicle)
        return vehicle

    def delete(self, vehicle_id: int) -> None:
        vehicle = self.get(vehicle_id)
        self.db.delete(vehicle)
        self.db.commit()

    def purchase(self, vehicle_id: int, quantity: int = 1) -> Vehicle:
        """
        Decrease stock atomically.

        A naive "read quantity, subtract, save" lets two buyers grab the last car at the
        same time. Instead we run ONE conditional UPDATE: it only succeeds if enough stock
        is still there at the moment the database executes it.
        """
        self.get(vehicle_id)  # 404 if the vehicle doesn't exist
        result = self.db.execute(
            update(Vehicle)
            .where(Vehicle.id == vehicle_id, Vehicle.quantity >= quantity)
            .values(quantity=Vehicle.quantity - quantity)
        )
        if result.rowcount == 0:
            self.db.rollback()
            raise OutOfStockError("Not enough stock to complete this purchase")
        self.db.commit()
        return self._reload(vehicle_id)

    def restock(self, vehicle_id: int, quantity: int) -> Vehicle:
        self.get(vehicle_id)
        self.db.execute(
            update(Vehicle)
            .where(Vehicle.id == vehicle_id)
            .values(quantity=Vehicle.quantity + quantity)
        )
        self.db.commit()
        return self._reload(vehicle_id)

    def _reload(self, vehicle_id: int) -> Vehicle:
        vehicle = self.get(vehicle_id)
        self.db.refresh(vehicle)
        return vehicle
