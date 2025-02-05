FROM python:3.10

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

RUN python train.py 

COPY . .

CMD ["python", "prev.py"]
