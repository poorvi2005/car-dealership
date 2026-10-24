"""Tests for purchase and restock (the stock-changing endpoints)."""


def stock_of(client, headers, vehicle_id):
    vehicles = client.get("/api/vehicles", headers=headers).json()
    return next(v["quantity"] for v in vehicles if v["id"] == vehicle_id)


class TestPurchase:
    def test_purchase_decreases_quantity_by_one(self, client, user_headers, vehicle):
        res = client.post(f"/api/vehicles/{vehicle['id']}/purchase", headers=user_headers)
        assert res.status_code == 200
        assert res.json()["quantity"] == vehicle["quantity"] - 1

    def test_purchase_several_units(self, client, user_headers, vehicle):
        res = client.post(
            f"/api/vehicles/{vehicle['id']}/purchase", json={"quantity": 2}, headers=user_headers
        )
        assert res.json()["quantity"] == vehicle["quantity"] - 2

    def test_cannot_buy_more_than_in_stock(self, client, user_headers, vehicle):
        res = client.post(
            f"/api/vehicles/{vehicle['id']}/purchase", json={"quantity": 99}, headers=user_headers
        )
        assert res.status_code == 400
        assert stock_of(client, user_headers, vehicle["id"]) == vehicle["quantity"]  # unchanged

    def test_cannot_buy_when_sold_out(self, client, user_headers, vehicle):
        for _ in range(vehicle["quantity"]):
            client.post(f"/api/vehicles/{vehicle['id']}/purchase", headers=user_headers)
        res = client.post(f"/api/vehicles/{vehicle['id']}/purchase", headers=user_headers)
        assert res.status_code == 400
        assert stock_of(client, user_headers, vehicle["id"]) == 0  # never negative

    def test_purchase_quantity_must_be_positive(self, client, user_headers, vehicle):
        res = client.post(
            f"/api/vehicles/{vehicle['id']}/purchase", json={"quantity": 0}, headers=user_headers
        )
        assert res.status_code == 422

    def test_purchase_missing_vehicle_is_404(self, client, user_headers):
        assert client.post("/api/vehicles/999/purchase", headers=user_headers).status_code == 404


class TestRestock:
    def test_admin_can_restock(self, client, admin_headers, vehicle):
        res = client.post(
            f"/api/vehicles/{vehicle['id']}/restock", json={"quantity": 5}, headers=admin_headers
        )
        assert res.status_code == 200
        assert res.json()["quantity"] == vehicle["quantity"] + 5

    def test_regular_user_cannot_restock(self, client, user_headers, vehicle):
        res = client.post(
            f"/api/vehicles/{vehicle['id']}/restock", json={"quantity": 5}, headers=user_headers
        )
        assert res.status_code == 403

    def test_restock_quantity_must_be_positive(self, client, admin_headers, vehicle):
        res = client.post(
            f"/api/vehicles/{vehicle['id']}/restock", json={"quantity": -3}, headers=admin_headers
        )
        assert res.status_code == 422

    def test_restock_missing_vehicle_is_404(self, client, admin_headers):
        res = client.post("/api/vehicles/999/restock", json={"quantity": 1}, headers=admin_headers)
        assert res.status_code == 404

    def test_sold_out_vehicle_can_be_bought_again_after_restock(
        self, client, user_headers, admin_headers, vehicle
    ):
        vid = vehicle["id"]
        client.post(f"/api/vehicles/{vid}/purchase", json={"quantity": 3}, headers=user_headers)
        client.post(f"/api/vehicles/{vid}/restock", json={"quantity": 1}, headers=admin_headers)
        assert client.post(f"/api/vehicles/{vid}/purchase", headers=user_headers).status_code == 200
