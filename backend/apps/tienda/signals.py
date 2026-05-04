from __future__ import annotations

# Signals are intentionally empty. Inventory writes are handled via explicit
# transactional helpers (helpers.apply_movimiento_atomically) to allow
# select_for_update() coordination. See TDD §8.1.
