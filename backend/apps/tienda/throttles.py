from __future__ import annotations

from rest_framework.throttling import UserRateThrottle


class TiendaWriteThrottle(UserRateThrottle):
    """Rate-limits write-heavy Tienda endpoints (recepcionar, cerrar, ajustes).

    Operates in a dedicated scope separate from the global 'user' throttle
    so that Tienda write operations have their own independent counter.
    """

    scope: str = "tienda_write"
