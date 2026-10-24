"""
Vehicle + inventory endpoints. Every route here requires a logged-in user;
create/update/delete/restock additionally require an admin.
"""
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user, require_admin
from app.schemas import VEHICLE_CATEGORIES, StockChange, VehicleCreate, VehicleOut, VehicleUpdate
from app.services import NotFoundError
from app.services.vehicle_service import VehicleService

router = APIRouter(prefix="/api/vehicles", tags=["vehicles"], dependencies=[Depends(get_current_user)])


def get_service(db: Session = Depends(get_db)) -> VehicleService:
    return VehicleService(db)


def _not_found(e: NotFoundError) -> HTTPException:
    return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("", response_model=list[VehicleOut])
def list_vehicles(service: VehicleService = Depends(get_service)):
    return service.list_all()


@router.get("/categories", response_model=list[str])
def list_categories():
    return list(VEHICLE_CATEGORIES)


# NOTE: "/search" must be declared before "/{vehicle_id}" style routes so it isn't
# mistaken for an id. (Only PUT/DELETE use the id here, but keeping the order is a good habit.)
@router.get("/search", response_model=list[VehicleOut])
def search_vehicles(
    make: str | None = None,
    model: str | None = None,
    category: str | None = None,
    min_price: Decimal | None = Query(default=None, ge=0),
    max_price: Decimal | None = Query(default=None, ge=0),
    service: VehicleService = Depends(get_service),
):
    if min_price is not None and max_price is not None and min_price > max_price:
        raise HTTPException(status_code=422, detail="min_price cannot be greater than max_price")
    return service.search(make, model, category, min_price, max_price)


@router.post(
    "",
    response_model=VehicleOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_admin)],
)
def create_vehicle(data: VehicleCreate, service: VehicleService = Depends(get_service)):
    return service.create(data)


@router.put("/{vehicle_id}", response_model=VehicleOut, dependencies=[Depends(require_admin)])
def update_vehicle(vehicle_id: int, data: VehicleUpdate, service: VehicleService = Depends(get_service)):
    try:
        return service.update(vehicle_id, data)
    except NotFoundError as e:
        raise _not_found(e)


@router.delete(
    "/{vehicle_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_admin)],
)
def delete_vehicle(vehicle_id: int, service: VehicleService = Depends(get_service)):
    try:
        service.delete(vehicle_id)
    except NotFoundError as e:
        raise _not_found(e)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/{vehicle_id}/purchase", response_model=VehicleOut)
def purchase_vehicle(vehicle_id: int, body: StockChange | None = None):
    # Stub: route exists (so auth checks are testable) but buying isn't built yet.
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Not implemented yet")


@router.post("/{vehicle_id}/restock", response_model=VehicleOut, dependencies=[Depends(require_admin)])
def restock_vehicle(vehicle_id: int, body: StockChange):
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Not implemented yet")
