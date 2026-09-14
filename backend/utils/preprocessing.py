import io
import torch
import torch.nn.functional as F
import numpy as np
from PIL import Image

def process_upload_to_tensor(image_bytes: bytes) -> torch.Tensor:
    """
    Reads raw upload bytes, converts to grayscale, and outputs a normalized tensor.
    Contract: Input bytes -> Output [1, 1, H, W] float32 tensor range [0, 1]
    """
    # Load image from bytes and ensure grayscale
    img = Image.open(io.BytesIO(image_bytes)).convert('L')
    img_np = np.array(img, dtype=np.float32) / 255.0
    
    # Add batch and channel dimensions: [H, W] -> [1, 1, H, W]
    tensor = torch.from_numpy(img_np).unsqueeze(0).unsqueeze(0)
    return tensor

def pad_to_multiple(tensor: torch.Tensor, multiple: int = 8) -> tuple[torch.Tensor, tuple[int, int]]:
    """
    Pads H and W dimensions to the nearest multiple of `multiple` (required for NAFNet).
    Uses 'reflect' padding to preserve edge statistics better than zero padding.
    Returns: Padded tensor, Original (H, W) for cropping later.
    """
    _, _, h, w = tensor.shape
    pad_h = (multiple - h % multiple) % multiple
    pad_w = (multiple - w % multiple) % multiple
    
    padded = F.pad(tensor, (0, pad_w, 0, pad_h), mode='reflect')
    return padded, (h, w)

def crop_to_original(tensor: torch.Tensor, original_hw: tuple[int, int]) -> torch.Tensor:
    """Removes padding added by pad_to_multiple."""
    h, w = original_hw
    return tensor[:, :, :h, :w]

def tensor_to_base64_png(tensor: torch.Tensor) -> str:
    """
    Converts a [1, 1, H, W] float32 tensor back to a base64 encoded PNG string 
    for transmission to the frontend.
    """
    import base64
    
    # Remove batch and channel dims, clamp to valid range, convert to uint8
    image_out = tensor.squeeze(0).squeeze(0).clamp(0, 1).cpu().numpy()
    image_out = (image_out * 255).astype(np.uint8)
    
    img = Image.fromarray(image_out)
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    return base64.b64encode(buffered.getvalue()).decode("utf-8")