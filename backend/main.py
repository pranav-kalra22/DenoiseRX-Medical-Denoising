import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import torch
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from utils.rate_limit import limiter
from routers import denoise, jobs
from models.nafnet import NAFNet

# Path to your ablation-tested weights
MODEL_PATH = os.path.join(os.path.dirname(__file__), "weights", "nafnet_l1_best_psnr.pth")

@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.job_store = {}
    app.state.results_cache = {}
    
    # 1. Determine execution hardware
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"System targeting device context: {device}")
    app.state.device = device

    # 2. Initialize Structural Topology
    print("Initializing DenoiseRX NAFNet architecture...")
    model = NAFNet(
        img_channel=1,
        width=16,
        middle_blk_num=4,
        enc_blks=[1, 1, 2, 4],
        dec_blks=[1, 1, 2, 4]
    )

    # 3. Mount Weights
    try:
        model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
        print("L1-Ablated weights loaded into VRAM successfully.")
    except FileNotFoundError:
        print(f"NOTICE: Weights not found at {MODEL_PATH}. Running with base architecture.")
    
    model.to(device)
    model.eval()
    app.state.nafnet = model

    yield

    # Cleanup
    print("Shutting down. Clearing memory...")
    app.state.job_store.clear()
    app.state.results_cache.clear()

app = FastAPI(
    title="DenoiseRX API",
    description="Asynchronous X-Ray Denoising via Pure L1 Ablation NAFNet",
    version="2.1.0",
    lifespan=lifespan
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(denoise.router, prefix="/denoise", tags=["Inference"])
app.include_router(jobs.router, prefix="/job", tags=["Job Queue"])

@app.get("/health", tags=["System"])
@limiter.limit("30/minute")
async def health_check(request: Request):
    return {
        "status": "ok",
        "models_loaded": {"nafnet": request.app.state.nafnet is not None},
        "cache_entries": len(request.app.state.results_cache),
        "active_jobs": sum(1 for j in request.app.state.job_store.values() if j.get("status") in ["queued", "processing"])
    }