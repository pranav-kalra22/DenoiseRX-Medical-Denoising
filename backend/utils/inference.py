import io
import time
import numpy as np
import torch
import torch.nn.functional as F
from PIL import Image

def pil_to_tensor(img: Image.Image) -> torch.Tensor:
    """Convert any incoming PIL image mode to a normalized grayscale tensor."""
    img = img.convert("L")
    arr = np.asarray(img, dtype=np.float32) / 255.0
    return torch.from_numpy(arr).unsqueeze(0)  # [1, H, W]

def tensor_to_bytes(tensor: torch.Tensor) -> bytes:
    """Convert tensor back into PNG byte data to send across the API."""
    tensor = tensor.squeeze().clamp(0, 1)
    arr = (tensor.cpu().numpy() * 255).astype(np.uint8)
    img = Image.fromarray(arr, mode="L")
    
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    return buffer.getvalue()

def pad_to_multiple(tensor: torch.Tensor, multiple: int = 16):
    _, h, w = tensor.shape
    pad_h = (multiple - h % multiple) % multiple
    pad_w = (multiple - w % multiple) % multiple
    padded = F.pad(tensor, (0, pad_w, 0, pad_h), mode="reflect")
    return padded, h, w

def run_model_inference(model, input_bytes: bytes, device: torch.device):
    """Executes the exact padding, timing, and evaluation pipeline."""
    img = Image.open(io.BytesIO(input_bytes))
    clean_tensor = pil_to_tensor(img)
    
    padded, orig_h, orig_w = pad_to_multiple(clean_tensor)
    padded = padded.unsqueeze(0).to(device)  # Add batch dimension [1, 1, H, W]

    if device.type == "cuda":
        torch.cuda.synchronize()

    start_time = time.perf_counter()
    with torch.inference_mode():
        output = model(padded)

    if device.type == "cuda":
        torch.cuda.synchronize()
    elapsed_time = time.perf_counter() - start_time

    output = output.squeeze(0).cpu()  # Remove batch dim
    output = output[:, :orig_h, :orig_w]  # Remove padding
    
    output_bytes = tensor_to_bytes(output)
    return output_bytes, elapsed_time