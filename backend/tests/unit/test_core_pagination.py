from __future__ import annotations

from apps.core.pagination import StandardResultsSetPagination


def test_pagination_page_size() -> None:
    paginator = StandardResultsSetPagination()
    assert paginator.page_size == 20


def test_pagination_page_size_query_param() -> None:
    paginator = StandardResultsSetPagination()
    assert paginator.page_size_query_param == "page_size"


def test_pagination_max_page_size() -> None:
    paginator = StandardResultsSetPagination()
    assert paginator.max_page_size == 100
