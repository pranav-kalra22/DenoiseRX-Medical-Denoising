import numpy as np
import torch
from skimage.metrics import structural_similarity as ssim

def calculate_psnr(clean_tensor: torch.Tensor, denoised_tensor: torch.Tensor) -> float:
    """
    Calculates Peak Signal-to-Noise Ratio.
    Assumes inputs are [1, 1, H, W] tensors in range [0, 1].
    """
    mse = torch.nn.functional.mse_loss(clean_tensor, denoised_tensor)
    if mse == 0:
        return float('inf')
    
    # MAX_pixel is 1.0 because tensors are normalized to [0, 1]
    psnr = 20 * torch.log10(1.0 / torch.sqrt(mse))
    return round(psnr.item(), 2)

def calculate_ssim(clean_tensor: torch.Tensor, denoised_tensor: torch.Tensor) -> float:
    """
    Calculates Structural Similarity Index.
    Converts tensors to numpy arrays as required by skimage.
    """
    clean_np = clean_tensor.squeeze(0).squeeze(0).cpu().numpy()
    denoised_np = denoised_tensor.squeeze(0).squeeze(0).cpu().numpy()
    
    # data_range is 1.0 because tensors are normalized to [0, 1]
    score = ssim(clean_np, denoised_np, data_range=1.0)
    return round(float(score), 4)