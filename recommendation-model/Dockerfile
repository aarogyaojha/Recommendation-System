# Use an official Python image
FROM python:3.10

# Set the working directory
WORKDIR /app

# Copy only requirements first for caching
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the app files
COPY . .

# Use a virtual environment (.venv)
RUN python -m venv .venv && \
    . .venv/bin/activate && \
    pip install --no-cache-dir -r requirements.txt

# Set the default command (modify as needed)
CMD [".venv/bin/python", "final.py"]
