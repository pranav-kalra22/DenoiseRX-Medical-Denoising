import uuid
from fastapi import APIRouter, Request, UploadFile, File, Form, BackgroundTasks, HTTPException
from utils.jobs import run_inference_task
from utils.rate_limit import limiter
from utils.cache import check_cache

router = APIRouter()

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB
ALLOWED_TYPES = ["image/jpeg", "image/png"]

async def validate_and_read_file(file: UploadFile) -> bytes:
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Invalid file type. Only PNG and JPG are accepted.")
    image_bytes = await file.read()
    if len(image_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 5MB.")
    return image_bytes

@router.post("/process")
@limiter.limit("5/minute")
async def process_image(
    request: Request,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    sigma: int = Form(25),
    add_noise: bool = Form(False)
):
    image_bytes = await validate_and_read_file(file)
    model_name = "nafnet"

    cached_result = check_cache(request.app.state.results_cache, image_bytes, model_name, sigma)
    if cached_result:
        job_id = str(uuid.uuid4())[:8]
        return {"job_id": job_id, "cache_hit": True, **cached_result}

    job_id = str(uuid.uuid4())[:8]
    request.app.state.job_store[job_id] = {
        "status": "queued",
        "model": model_name,
        "cache_hit": False
    }

    # Execute Background Task
    background_tasks.add_task(
        run_inference_task,
        job_id=job_id,
        image_bytes=image_bytes,
        model_name=model_name,
        sigma=sigma,
        add_noise=add_noise,
        job_store=request.app.state.job_store,
        cache_store=request.app.state.results_cache,
        model=request.app.state.nafnet,
        device=request.app.state.device
    )

    return {"job_id": job_id, "status": "queued", "model": model_name, "cache_hit": False}