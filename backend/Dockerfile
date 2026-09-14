# Use a lightweight Python base image
FROM python:3.10-slim

# Create a non-root user (Required by Hugging Face Spaces)
RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH

# Set the working directory
WORKDIR $HOME/app

# Copy requirements first to leverage Docker cache
COPY --chown=user requirements.txt .

# THE ML CHEAT CODE: 
# We use --extra-index-url to force pip to download the CPU-only version of PyTorch.
# This shrinks the image size by ~2GB and prevents Out-Of-Memory crashes on free tiers.
RUN pip install --no-cache-dir -r requirements.txt --extra-index-url https://download.pytorch.org/whl/cpu

# Copy the rest of your backend application code
COPY --chown=user . .

# Hugging Face Spaces routes traffic to port 7860 by default
EXPOSE 7860

# Command to run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]