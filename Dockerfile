FROM python:3.13.2-alpine
WORKDIR /src
COPY requirements.txt .
RUN python -m pip install -r requirements.txt
COPY . .
EXPOSE 5000
WORKDIR /src/backend
CMD [ "python3", "-m" , "flask", "run", "--host=0.0.0.0"]
