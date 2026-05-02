from rest_framework.pagination import PageNumberPagination


class StandardResultsSetPagination(PageNumberPagination):
    """
    Default pagination class for all Hersa API endpoints.

    Enforces a hard cap of 100 results per page to prevent bulk
    data exfiltration via large `page_size` query parameters.
    """

    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100
