FROM python:3.10-slim

# Create a non-root user (Hugging Face requirement)
RUN useradd -m -u 1000 user
ENV PATH="/home/user/.local/bin:$PATH"

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    && rm -rf /var/lib/apt/lists/*

# Switch to the non-root user
USER user

# Copy requirements and install
COPY --chown=user requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY --chown=user . .

# Hugging face explicitly looks for port 7860
EXPOSE 7860

# Set environment variables for Flask
ENV FLASK_APP=run.py
ENV PYTHONUNBUFFERED=1

# Run the Flask app on port 7860
CMD ["flask", "run", "--host=0.0.0.0", "--port=7860"]