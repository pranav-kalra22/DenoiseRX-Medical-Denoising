from fastapi import APIRouter, Request, HTTPException
from utils.rate_limit import limiter

router = APIRouter()

@router.get("/{job_id}")
@limiter.limit("60/minute") # Higher rate limit here because the frontend polls this frequently
async def get_job_status(request: Request, job_id: str):
    """
    Checks the global job store for the status of an inference task.
    """
    job = request.app.state.job_store.get(job_id)
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found or expired.")
        
    return job