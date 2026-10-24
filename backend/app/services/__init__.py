"""
Service layer: business rules live here, independent of HTTP.

Services raise the domain errors below; routers translate them into HTTP status codes.
That keeps each layer doing one job (Single Responsibility) and lets us test rules directly.
"""


class DomainError(Exception):
    """Base class for expected business-rule failures."""


class NotFoundError(DomainError):
    pass


class ConflictError(DomainError):
    pass


class InvalidCredentialsError(DomainError):
    pass


class OutOfStockError(DomainError):
    pass
