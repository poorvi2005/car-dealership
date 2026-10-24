"""Tests for vehicle CRUD and search endpoints."""
import pytest

from tests.conftest import SAMPLE_VEHICLE


def add(client, headers, **overrides):
    return client.post("/api/vehicles", json={**SAMPLE_VEHICLE, **overrides}, headers=headers)


class TestProtection:
    @pytest.mark.parametrize(
        "method,url",
        [
            ("get", "/api/vehicles"),
            ("get", "/api/vehicles/search"),
            ("post", "/api/vehicles"),
            ("put", "/api/vehicles/1"),
            ("delete", "/api/vehicles/1"),
            ("post", "/api/vehicles/1/purchase"),
            ("post", "/api/vehicles/1/restock"),
        ],
    )
    def test_every_vehicle_route_requires_login(self, client, method, url):
        assert getattr(client, method)(url).status_code == 401


class TestCreate:
    def test_admin_can_add_vehicle(self, client, admin_headers):
        res = add(client, admin_headers)
        assert res.status_code == 201
        body = res.json()
        assert body["id"] > 0
        assert body["make"] == "Toyota"
        assert body["price"] == 1850000
        assert body["quantity"] == 3

    def test_regular_user_cannot_add_vehicle(self, client, user_headers):
        assert add(client, user_headers).status_code == 403

    def test_category_must_be_known(self, client, admin_headers):
        assert add(client, admin_headers, category="Spaceship").status_code == 422

    def test_category_is_normalised(self, client, admin_headers):
        assert add(client, admin_headers, category="suv").json()["category"] == "SUV"

    @pytest.mark.parametrize("field,value", [("price", -1), ("quantity", -5), ("make", "")])
    def test_invalid_values_rejected(self, client, admin_headers, field, value):
        assert add(client, admin_headers, **{field: value}).status_code == 422


class TestList:
    def test_list_returns_all_vehicles(self, client, admin_headers, user_headers):
        add(client, admin_headers)
        add(client, admin_headers, make="Honda", model="City")
        res = client.get("/api/vehicles", headers=user_headers)
        assert res.status_code == 200
        assert [v["make"] for v in res.json()] == ["Toyota", "Honda"]

    def test_list_empty(self, client, user_headers):
        assert client.get("/api/vehicles", headers=user_headers).json() == []

    def test_categories_endpoint(self, client, user_headers):
        cats = client.get("/api/vehicles/categories", headers=user_headers).json()
        assert "SUV" in cats and "Sedan" in cats


class TestSearch:
    @pytest.fixture(autouse=True)
    def lot(self, client, admin_headers):
        add(client, admin_headers, make="Toyota", model="Corolla", category="Sedan", price=1850000)
        add(client, admin_headers, make="Toyota", model="Fortuner", category="SUV", price=3800000)
        add(client, admin_headers, make="Tata", model="Nexon EV", category="Electric", price=1500000)
        add(client, admin_headers, make="Maruti", model="Swift", category="Hatchback", price=700000)

    def search(self, client, headers, **params):
        res = client.get("/api/vehicles/search", params=params, headers=headers)
        assert res.status_code == 200
        return [v["model"] for v in res.json()]

    def test_by_make_is_partial_and_case_insensitive(self, client, user_headers):
        assert self.search(client, user_headers, make="toy") == ["Corolla", "Fortuner"]

    def test_by_model(self, client, user_headers):
        assert self.search(client, user_headers, model="nexon") == ["Nexon EV"]

    def test_by_category(self, client, user_headers):
        assert self.search(client, user_headers, category="suv") == ["Fortuner"]

    def test_by_price_range(self, client, user_headers):
        result = self.search(client, user_headers, min_price=1000000, max_price=2000000)
        assert result == ["Nexon EV", "Corolla"]  # sorted by price, cheapest first

    def test_filters_combine(self, client, user_headers):
        assert self.search(client, user_headers, make="Toyota", max_price=2000000) == ["Corolla"]

    def test_no_filters_returns_everything(self, client, user_headers):
        assert len(self.search(client, user_headers)) == 4

    def test_no_match_returns_empty_list(self, client, user_headers):
        assert self.search(client, user_headers, make="Ferrari") == []

    def test_inverted_price_range_is_rejected(self, client, user_headers):
        res = client.get(
            "/api/vehicles/search", params={"min_price": 10, "max_price": 5}, headers=user_headers
        )
        assert res.status_code == 422


class TestUpdate:
    def test_admin_can_update_some_fields(self, client, admin_headers, vehicle):
        res = client.put(f"/api/vehicles/{vehicle['id']}", json={"price": 1799000}, headers=admin_headers)
        assert res.status_code == 200
        assert res.json()["price"] == 1799000
        assert res.json()["model"] == "Corolla"  # untouched fields stay the same

    def test_update_missing_vehicle_is_404(self, client, admin_headers):
        assert client.put("/api/vehicles/999", json={"price": 1}, headers=admin_headers).status_code == 404

    def test_regular_user_cannot_update(self, client, user_headers, vehicle):
        res = client.put(f"/api/vehicles/{vehicle['id']}", json={"price": 1}, headers=user_headers)
        assert res.status_code == 403

    def test_update_validates_values(self, client, admin_headers, vehicle):
        res = client.put(f"/api/vehicles/{vehicle['id']}", json={"quantity": -1}, headers=admin_headers)
        assert res.status_code == 422


class TestDelete:
    def test_admin_can_delete(self, client, admin_headers, vehicle):
        assert client.delete(f"/api/vehicles/{vehicle['id']}", headers=admin_headers).status_code == 204
        assert client.get("/api/vehicles", headers=admin_headers).json() == []

    def test_regular_user_cannot_delete(self, client, user_headers, vehicle):
        assert client.delete(f"/api/vehicles/{vehicle['id']}", headers=user_headers).status_code == 403

    def test_delete_missing_vehicle_is_404(self, client, admin_headers):
        assert client.delete("/api/vehicles/999", headers=admin_headers).status_code == 404
