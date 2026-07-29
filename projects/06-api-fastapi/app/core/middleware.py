import time
from fastapi import Request, Response, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from app.schemas import ErrorResponse, ErrorEnvelopeBody, ErrorDetail


async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Response-Time"] = f"{process_time:.4f}s"
    return response


def register_exception_handlers(app):
    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        details = []
        for error in exc.errors():
            field = ".".join(str(loc) for loc in error.get("loc", []) if loc not in ("body", "query", "path"))
            details.append(ErrorDetail(field=field if field else None, message=error.get("msg", "Invalid input")))
        error_envelope = ErrorResponse(
            success=False,
            error=ErrorEnvelopeBody(
                code="VALIDATION_ERROR",
                message="Invalid request parameters",
                details=details
            )
        )
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content=error_envelope.model_dump())

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException):
        code_mapping = {
            400: "VALIDATION_ERROR",
            401: "UNAUTHORIZED",
            403: "FORBIDDEN",
            404: "NOT_FOUND",
            409: "CONFLICT",
            429: "RATE_LIMITED",
            500: "INTERNAL_SERVER_ERROR"
        }
        error_code = code_mapping.get(exc.status_code, "INTERNAL_SERVER_ERROR")
        error_envelope = ErrorResponse(
            success=False,
            error=ErrorEnvelopeBody(
                code=error_code,
                message=str(exc.detail) if exc.detail else "An error occurred"
            )
        )
        return JSONResponse(status_code=exc.status_code, content=error_envelope.model_dump())

    @app.exception_handler(Exception)
    async def generic_exception_handler(request: Request, exc: Exception):
        error_envelope = ErrorResponse(
            success=False,
            error=ErrorEnvelopeBody(
                code="INTERNAL_SERVER_ERROR",
                message="An unexpected server error occurred"
            )
        )
        return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content=error_envelope.model_dump())