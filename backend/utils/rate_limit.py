from slowapi import Limiter
from slowapi.util import get_remote_address

# This single instance will be shared across main.py and all routers
limiter = Limiter(key_func=get_remote_address)