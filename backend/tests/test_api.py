import io
import pytest
from fastapi.testclient import TestClient
import torch
import torch.nn as nn
from PIL import Image

# Import your FastAPI app
from main import app

# ---------------------------------------------------------
# 1. The Dummy PyTorch Model
# ---------------------------------------------------------
class DummyModel(nn.Module):
    """
    A fake model that mimics the I/O contract of NAFNet.
    Takes a [1, 1, H, W] tensor and returns a [1, 1, H, W] tensor.
    """
    def forward(self, x):
        return x * 0.9 

# ---------------------------------------------------------
# 2. Test Setup & Fixtures
# ---------------------------------------------------------
client = TestClient(app)

def generate_dummy_image(width=100, height=100) -> bytes:
    """Generates a gray PNG image in memory for testing uploads."""
    img = Image.new('L', (width, height), color=128)
    buf = io.BytesIO()
    img.save(buf, format='PNG')
    return buf.getvalue()

@pytest.fixture(autouse=True)
def setup_test_environment():
    """
    Runs before every test. Injects our Dummy PyTorch model into the app state
    and clears the cache/job queue so tests don't interfere with each other.
    """
    app.state.nafnet = DummyModel()
    app.state.device = torch.device("cpu")
    app.state.job_store = {}
    app.state.results_cache = {}
    yield

# ---------------------------------------------------------
# 3. The Tests
# ---------------------------------------------------------

def test_health_check():
    """Test 1: Does the health check endpoint return 200 OK and see our model?"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["models_loaded"]["nafnet"] is True

def test_denoise_process_pipeline():
    """Test 2: Does an upload successfully process and return a job?"""
    dummy_img = generate_dummy_image(width=100, height=100)
    
    # 1. Submit the job
    response = client.post(
        "/denoise/process",
        files={"file": ("test.png", dummy_img, "image/png")},
        data={"sigma": 25, "add_noise": True}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "queued"
    assert data["cache_hit"] is False
    job_id = data["job_id"]

    # 2. Poll the job (FastAPI TestClient runs background tasks synchronously)
    poll_response = client.get(f"/job/{job_id}")
    assert poll_response.status_code == 200
    poll_data = poll_response.json()
    
    assert poll_data["status"] == "complete"
    assert "denoised_image" in poll_data
    assert "noisy_image" in poll_data
    assert "psnr" in poll_data
    assert "ssim" in poll_data
    assert poll_data["image_shape"] == [100, 100]

def test_caching_mechanism():
    """Test 3: Does uploading the identical image hit the cache instantly?"""
    dummy_img = generate_dummy_image()
    
    # Upload 1: Cache Miss
    res1 = client.post(
        "/denoise/process",
        files={"file": ("test.png", dummy_img, "image/png")},
        data={"sigma": 25, "add_noise": False}
    )
    assert res1.status_code == 200
    assert res1.json()["cache_hit"] is False

    # Upload 2: Cache Hit
    res2 = client.post(
        "/denoise/process",
        files={"file": ("test.png", dummy_img, "image/png")},
        data={"sigma": 25, "add_noise": False}
    )
    assert res2.status_code == 200
    assert res2.json()["cache_hit"] is True
    assert res2.json()["status"] == "complete"
    assert "denoised_image" in res2.json()

def test_invalid_file_type():
    """Test 4: Does uploading an invalid file type get rejected with 400?"""
    res = client.post(
        "/denoise/process",
        files={"file": ("test.txt", b"not an image", "text/plain")},
        data={"sigma": 25}
    )
    assert res.status_code == 400
    assert "Invalid file type" in res.json()["detail"]

def test_job_not_found():
    """Test 5: Does polling a nonexistent job return 404?"""
    res = client.get("/job/nonexistent_id")
    assert res.status_code == 404