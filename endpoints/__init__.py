from fastapi.responses import JSONResponse


def _err(reason):
    return JSONResponse(content={"successful": False, "reason": reason})


def _succ(**kwargs):
    return JSONResponse(content={"successful": True, **kwargs})
