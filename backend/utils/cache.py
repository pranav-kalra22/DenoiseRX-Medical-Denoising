import hashlib
from typing import Optional, Dict, Any

def get_cache_key(image_bytes: bytes, model: str, sigma: int) -> str:
    """
    Generates a deterministic MD5 hash based on the image content and requested parameters.
    """
    content = image_bytes + model.encode('utf-8') + str(sigma).encode('utf-8')
    return hashlib.md5(content).hexdigest()

def check_cache(cache_store: dict, image_bytes: bytes, model: str, sigma: int) -> Optional[Dict[str, Any]]:
    """
    Checks if the exact inference request has already been processed.
    Returns the cached result dict if found, otherwise None.
    """
    key = get_cache_key(image_bytes, model, sigma)
    return cache_store.get(key)

def write_to_cache(cache_store: dict, image_bytes: bytes, model: str, sigma: int, result: Dict[str, Any]) -> None:
    """
    Saves a completed inference result to the in-memory cache.
    """
    key = get_cache_key(image_bytes, model, sigma)
    cache_store[key] = result