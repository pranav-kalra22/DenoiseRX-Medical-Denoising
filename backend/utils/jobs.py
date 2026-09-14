import io
import time
import base64
import traceback
import numpy as np
import torch
import torch.nn.functional as F
from PIL import Image
from skimage.metrics import peak_signal_noise_ratio, structural_similarity
from utils.cache import write_to_cache

def pil_to_tensor(img: Image.Image) -> torch.Tensor:
    img = img.convert("L")
    arr = np.asarray(img, dtype=np.float32) / 255.0
    return torch.from_numpy(arr).unsqueeze(0).unsqueeze(0)  # [1, 1, H, W]

def tensor_to_base64_png(tensor: torch.Tensor) -> str:
    tensor = tensor.squeeze().clamp(0, 1)
    arr = (tensor.cpu().numpy() * 255).astype(np.uint8)
    img = Image.fromarray(arr, mode="L")
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    return base64.b64encode(buffer.getvalue()).decode('utf-8')

def pad_to_multiple(tensor: torch.Tensor, multiple: int = 16):
    _, _, h, w = tensor.shape
    pad_h = (multiple - h % multiple) % multiple
    pad_w = (multiple - w % multiple) % multiple
    padded = F.pad(tensor, (0, pad_w, 0, pad_h), mode="reflect")
    return padded, h, w

def run_inference_task(
    job_id: str, 
    image_bytes: bytes, 
    model_name: str, 
    sigma: int, 
    add_noise: bool, 
    job_store: dict, 
    cache_store: dict, 
    model: torch.nn.Module,       # <--- THIS IS WHAT WAS MISSING
    device: torch.device          # <--- THIS IS WHAT WAS MISSING
) -> None:
    try:
        job_store[job_id]["status"] = "processing"
        start_time = time.perf_counter()

        # 1. Parse Image
        img = Image.open(io.BytesIO(image_bytes))
        clean_tensor = pil_to_tensor(img)
        _, _, orig_h, orig_w = clean_tensor.shape

        # 2. Add Synthetic Noise (if demo mode)
        if add_noise and sigma > 0:
            noise = torch.randn_like(clean_tensor) * (sigma / 255.0)
            noisy_tensor = torch.clamp(clean_tensor + noise, 0.0, 1.0)
        else:
            noisy_tensor = clean_tensor

        # 3. Pad for NAFNet Downsampling Constraints
        padded_input, _, _ = pad_to_multiple(noisy_tensor, multiple=16)
        padded_input = padded_input.to(device)

        # 4. Inference
        with torch.inference_mode():
            if device.type == "cuda": torch.cuda.synchronize()
            t0 = time.perf_counter()
            
            padded_output = model(padded_input)
            
            if device.type == "cuda": torch.cuda.synchronize()
            inference_time_ms = int((time.perf_counter() - t0) * 1000)

        # 5. Remove Padding
        output_tensor = padded_output.cpu()[:, :, :orig_h, :orig_w]

        # 6. Calculate Metrics via scikit-image
        clean_np = clean_tensor.squeeze().numpy()
        denoised_np = output_tensor.squeeze().clamp(0, 1).numpy()
        
        psnr_val = peak_signal_noise_ratio(clean_np, denoised_np, data_range=1.0)
        ssim_val = structural_similarity(clean_np, denoised_np, data_range=1.0)

        # 7. Package Payload
        noisy_b64 = tensor_to_base64_png(noisy_tensor)
        denoised_b64 = tensor_to_base64_png(output_tensor)

        result_payload = {
            "status": "complete",
            "model": model_name,
            "noisy_image": noisy_b64,
            "denoised_image": denoised_b64,
            "psnr": round(float(psnr_val), 2),
            "ssim": round(float(ssim_val), 4),
            "inference_time_ms": inference_time_ms,
            "image_shape": [orig_h, orig_w]
        }

        # 8. Store and Cache
        write_to_cache(cache_store, image_bytes, model_name, sigma, result_payload)
        job_store[job_id].update(result_payload)

    except Exception as e:
        print(f"[JOB {job_id} FAILED] {str(e)}")
        traceback.print_exc()
        job_store[job_id] = {
            "status": "failed",
            "error": "Internal inference error. Check server logs."
        }