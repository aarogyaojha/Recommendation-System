# Use an official Python image
FROM python:3.10

# Set the working directory
WORKDIR /app

# Copy only requirements.txt first for better caching
COPY requirements.txt .

# Install dependencies inside a virtual environment
RUN python -m venv /app/.venv && \
    /app/.venv/bin/pip install --no-cache-dir -r requirements.txt

# Copy the rest of the app files
COPY . .

# Set the virtual environment as default for the container
ENV PATH="/app/.venv/bin:$PATH"

# Start the Python script
CMD ["python", "final.py"]
