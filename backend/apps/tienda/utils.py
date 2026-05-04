from __future__ import annotations

from decimal import Decimal


def weighted_average(
    current_qty: Decimal,
    current_avg: Decimal,
    incoming_qty: int,
    incoming_cost: Decimal,
) -> Decimal:
    """BR-001 formula: (current_qty × current_avg + incoming_qty × incoming_cost) / (current_qty + incoming_qty)."""
    numerator: Decimal = current_qty * current_avg + Decimal(incoming_qty) * incoming_cost
    denominator: Decimal = current_qty + Decimal(incoming_qty)
    return decimal_safe_div(numerator, denominator, default=current_avg)


def decimal_safe_div(
    numerator: Decimal,
    denominator: Decimal,
    default: Decimal = Decimal("0"),
) -> Decimal:
    """Returns numerator / denominator, or default if denominator is zero."""
    if denominator == Decimal("0"):
        return default
    return numerator / denominator
