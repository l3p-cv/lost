import logging
import time

from fastapi.routing import APIRoute
from pydantic import AliasGenerator, BaseModel, ConfigDict, alias_generators

logger = logging.getLogger("lost")


class BaseModelWithCamelCase(BaseModel):
    model_config = ConfigDict(
        alias_generator=AliasGenerator(
            serialization_alias=alias_generators.to_camel,
            validation_alias=alias_generators.to_camel,
        ),
        populate_by_name=True,
    )


class ProfilingRoute(APIRoute):
    """Custom APIRoute that wraps each route handler with timing + Graylog logging.

    Replaces Flask's ``before_request``/``after_request`` block (app.py:130-152).
    When a router uses ``route_class=ProfilingRoute``, every route handler gets:

        request → [start timer] → [call handler] → [log timing + status] → response

    The ``"lost"`` logger gets the Graylog ``GelfUdpHandler`` attached once at
    startup (in ``fastapi_app.py``), so profiling logs are ingested by Graylog
    automatically when ``use_graylog`` is enabled.
    """

    def get_route_handler(self):
        original_handler = super().get_route_handler()

        async def profiled_handler(request):
            start = time.time()
            response = await original_handler(request)
            diff = time.time() - start
            logger.info(
                "Webservice Meta Info",
                extra={
                    "response_time": diff,
                    "response_code": response.status_code,
                },
            )
            return response

        return profiled_handler
