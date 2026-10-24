# Test report

Generated on 2026-10-24 from real runs of both suites. Re-create it any time with the commands below.

| Suite | Tool | Result | Coverage |
|---|---|---|---|
| Backend (FastAPI) | pytest + pytest-cov | **69 passed, 0 failed** | **97%** of app code |
| Frontend (React) | Vitest + Testing Library | **28 passed, 0 failed** | n/a |

## How to reproduce

```bash
cd backend && pytest -vv --cov=app --cov-report=term-missing
cd frontend && npm test
```

## Backend tests

<details><summary>All 69 backend tests</summary>

```
✓ test_app.py::test_database_url_is_normalised_for_psycopg[postgres://u:p@host/db-postgresql+psycopg://u:p@host/db]
✓ test_app.py::test_database_url_is_normalised_for_psycopg[postgresql://u:p@host/db-postgresql+psycopg://u:p@host/db]
✓ test_app.py::test_database_url_is_normalised_for_psycopg[sqlite:///./x.db-sqlite:///./x.db]
✓ test_app.py::test_admin_emails_and_cors_are_parsed_from_csv
✓ test_app.py::test_health_check
✓ test_app.py::test_token_for_deleted_user_is_rejected
✓ test_auth.py::TestRegister::test_register_returns_token_and_user
✓ test_auth.py::TestRegister::test_password_is_never_returned
✓ test_auth.py::TestRegister::test_email_is_case_insensitive_and_stored_lowercase
✓ test_auth.py::TestRegister::test_duplicate_email_is_rejected
✓ test_auth.py::TestRegister::test_invalid_email_is_rejected
✓ test_auth.py::TestRegister::test_short_password_is_rejected
✓ test_auth.py::TestRegister::test_configured_admin_email_becomes_admin
✓ test_auth.py::TestLogin::test_login_with_correct_credentials
✓ test_auth.py::TestLogin::test_login_with_wrong_password
✓ test_auth.py::TestLogin::test_login_unknown_email_gives_same_error_as_wrong_password
✓ test_auth.py::TestMe::test_me_returns_current_user
✓ test_auth.py::TestMe::test_me_without_token_is_401
✓ test_auth.py::TestMe::test_me_with_bad_token_is_401
✓ test_inventory.py::TestPurchase::test_purchase_decreases_quantity_by_one
✓ test_inventory.py::TestPurchase::test_purchase_several_units
✓ test_inventory.py::TestPurchase::test_cannot_buy_more_than_in_stock
✓ test_inventory.py::TestPurchase::test_cannot_buy_when_sold_out
✓ test_inventory.py::TestPurchase::test_purchase_quantity_must_be_positive
✓ test_inventory.py::TestPurchase::test_purchase_missing_vehicle_is_404
✓ test_inventory.py::TestRestock::test_admin_can_restock
✓ test_inventory.py::TestRestock::test_regular_user_cannot_restock
✓ test_inventory.py::TestRestock::test_restock_quantity_must_be_positive
✓ test_inventory.py::TestRestock::test_restock_missing_vehicle_is_404
✓ test_inventory.py::TestRestock::test_sold_out_vehicle_can_be_bought_again_after_restock
✓ test_security.py::test_hash_is_not_the_plain_password
✓ test_security.py::test_same_password_hashes_differently_each_time
✓ test_security.py::test_verify_password_accepts_correct_and_rejects_wrong
✓ test_security.py::test_verify_password_handles_garbage_hash
✓ test_security.py::test_token_round_trip_returns_subject
✓ test_security.py::test_expired_token_is_rejected
✓ test_security.py::test_tampered_token_is_rejected
✓ test_vehicles.py::TestProtection::test_every_vehicle_route_requires_login[get-/api/vehicles]
✓ test_vehicles.py::TestProtection::test_every_vehicle_route_requires_login[get-/api/vehicles/search]
✓ test_vehicles.py::TestProtection::test_every_vehicle_route_requires_login[post-/api/vehicles]
✓ test_vehicles.py::TestProtection::test_every_vehicle_route_requires_login[put-/api/vehicles/1]
✓ test_vehicles.py::TestProtection::test_every_vehicle_route_requires_login[delete-/api/vehicles/1]
✓ test_vehicles.py::TestProtection::test_every_vehicle_route_requires_login[post-/api/vehicles/1/purchase]
✓ test_vehicles.py::TestProtection::test_every_vehicle_route_requires_login[post-/api/vehicles/1/restock]
✓ test_vehicles.py::TestCreate::test_admin_can_add_vehicle
✓ test_vehicles.py::TestCreate::test_regular_user_cannot_add_vehicle
✓ test_vehicles.py::TestCreate::test_category_must_be_known
✓ test_vehicles.py::TestCreate::test_category_is_normalised
✓ test_vehicles.py::TestCreate::test_invalid_values_rejected[price--1]
✓ test_vehicles.py::TestCreate::test_invalid_values_rejected[quantity--5]
✓ test_vehicles.py::TestCreate::test_invalid_values_rejected[make-]
✓ test_vehicles.py::TestList::test_list_returns_all_vehicles
✓ test_vehicles.py::TestList::test_list_empty
✓ test_vehicles.py::TestList::test_categories_endpoint
✓ test_vehicles.py::TestSearch::test_by_make_is_partial_and_case_insensitive
✓ test_vehicles.py::TestSearch::test_by_model
✓ test_vehicles.py::TestSearch::test_by_category
✓ test_vehicles.py::TestSearch::test_by_price_range
✓ test_vehicles.py::TestSearch::test_filters_combine
✓ test_vehicles.py::TestSearch::test_no_filters_returns_everything
✓ test_vehicles.py::TestSearch::test_no_match_returns_empty_list
✓ test_vehicles.py::TestSearch::test_inverted_price_range_is_rejected
✓ test_vehicles.py::TestUpdate::test_admin_can_update_some_fields
✓ test_vehicles.py::TestUpdate::test_update_missing_vehicle_is_404
✓ test_vehicles.py::TestUpdate::test_regular_user_cannot_update
✓ test_vehicles.py::TestUpdate::test_update_validates_values
✓ test_vehicles.py::TestDelete::test_admin_can_delete
✓ test_vehicles.py::TestDelete::test_regular_user_cannot_delete
✓ test_vehicles.py::TestDelete::test_delete_missing_vehicle_is_404
```
</details>

### Coverage

```
Name                              Stmts   Miss  Cover
-----------------------------------------------------
app/__init__.py                       0      0   100%
app/config.py                        27      0   100%
app/database.py                      19      6    68%
app/dependencies.py                  22      0   100%
app/main.py                          20      2    90%
app/models.py                        28      0   100%
app/routers/__init__.py               0      0   100%
app/routers/auth.py                  29      0   100%
app/routers/vehicles.py              55      0   100%
app/schemas.py                       76      2    97%
app/security.py                      24      0   100%
app/services/__init__.py              9      0   100%
app/services/auth_service.py         28      3    89%
app/services/vehicle_service.py      63      0   100%
-----------------------------------------------------
TOTAL                               400     13    97%
```

The uncovered lines are start-up wiring (`init_db` and the real `get_db` generator), which the tests deliberately swap for an isolated in-memory database, plus a race-condition branch in registration that only runs when two identical sign-ups hit the database at the same instant.

## Frontend tests

<details><summary>All 28 frontend tests</summary>

```
✓ auth.test.jsx > LoginPage > logs in, stores the token and goes to the showroom
✓ auth.test.jsx > LoginPage > shows the server error on bad credentials
✓ auth.test.jsx > LoginPage > demo buttons fill the form
✓ auth.test.jsx > RegisterPage > blocks mismatched passwords before calling the API
✓ auth.test.jsx > RegisterPage > validates each rule
✓ auth.test.jsx > readableError > turns FastAPI validation lists into a sentence
✓ auth.test.jsx > readableError > passes plain strings through and falls back when empty
✓ VehicleCard.test.jsx > VehicleCard > shows the car details, price and plate
✓ VehicleCard.test.jsx > VehicleCard > calls onBuy with the vehicle when Buy is clicked
✓ VehicleCard.test.jsx > VehicleCard > disables the purchase button when quantity is zero
✓ VehicleCard.test.jsx > VehicleCard > hides admin controls from buyers
✓ VehicleCard.test.jsx > VehicleCard > shows edit, restock and delete to admins
✓ FilterBar.test.jsx > FilterBar > reports the new make when the user types
✓ FilterBar.test.jsx > FilterBar > selects a body type
✓ FilterBar.test.jsx > FilterBar > marks the active body type as pressed
✓ FilterBar.test.jsx > FilterBar > only offers "Clear filters" when something is filtered, and it resets everything
✓ format.test.js > formatINR > uses Indian lakh grouping
✓ format.test.js > formatINR > treats bad input as zero
✓ format.test.js > shortINR > shows lakh and crore
✓ format.test.js > plateFor > builds a Karnataka-style plate from make and id
✓ format.test.js > plateFor > ignores punctuation and pads short makes
✓ format.test.js > paintFor > matches paint names case-insensitively
✓ format.test.js > paintFor > falls back for unknown or missing colours
✓ format.test.js > stockStatus > quantity 0 -> Sold out
✓ format.test.js > stockStatus > quantity 1 -> Last one on the lot
✓ format.test.js > stockStatus > quantity 3 -> Only 3 left
✓ format.test.js > stockStatus > quantity 9 -> 9 on the lot
✓ format.test.js > shade > mixes toward white and black
```
</details>
