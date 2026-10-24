"""
Fill the database with a demo admin, a demo customer and a starter lot of cars.

    python seed.py

Safe to run more than once: it skips anything that already exists.
"""
from sqlalchemy import select

from app.database import SessionLocal, init_db
from app.models import User, Vehicle
from app.security import hash_password

DEMO_USERS = [
    # (email, name, password, is_admin)
    ("admin@dealership.com", "Priya Nair", "admin12345", True),
    ("buyer@example.com", "Rahul Mehta", "buyer12345", False),
]

DEMO_VEHICLES = [
    ("Toyota", "Fortuner Legender", "SUV", 2025, 4400000, 4, "Attitude Black"),
    ("Mahindra", "XUV700 AX7", "SUV", 2025, 2450000, 6, "Everest White"),
    ("Tata", "Nexon EV", "Electric", 2025, 1499000, 8, "Pristine White"),
    ("Hyundai", "Creta N Line", "SUV", 2024, 1980000, 3, "Thunder Blue"),
    ("Maruti Suzuki", "Swift ZXi", "Hatchback", 2025, 799000, 12, "Luster Blue"),
    ("Honda", "City e:HEV", "Sedan", 2024, 1990000, 2, "Radiant Red"),
    ("Skoda", "Slavia Style", "Sedan", 2025, 1869000, 0, "Lava Blue"),
    ("BMW", "Z4 M40i", "Convertible", 2024, 9290000, 1, "San Remo Green"),
    ("Toyota", "Hilux", "Truck", 2024, 3740000, 2, "Grey Metallic"),
    ("Mercedes-Benz", "AMG C43", "Coupe", 2024, 9800000, 0, "Obsidian Black"),
    ("MG", "Windsor EV", "Electric", 2025, 1399000, 5, "Turquoise Green"),
    ("Kia", "Sonet GTX+", "SUV", 2025, 1499000, 7, "Imperial Blue"),
]


def run() -> None:
    init_db()
    db = SessionLocal()
    try:
        for email, name, password, is_admin in DEMO_USERS:
            if not db.scalar(select(User).where(User.email == email)):
                db.add(User(email=email, full_name=name, hashed_password=hash_password(password), is_admin=is_admin))

        if db.scalar(select(Vehicle).limit(1)) is None:
            for make, model, category, year, price, qty, color in DEMO_VEHICLES:
                db.add(Vehicle(make=make, model=model, category=category, year=year,
                               price=price, quantity=qty, color=color))
        db.commit()
        print("Seed complete. Admin: admin@dealership.com / admin12345 | Buyer: buyer@example.com / buyer12345")
    finally:
        db.close()


if __name__ == "__main__":
    run()
