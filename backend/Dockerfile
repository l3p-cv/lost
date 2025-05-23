FROM python:3.13

RUN apt update && apt install -y netcat-traditional libgl1 libglib2.0-0 mariadb-client

COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv
WORKDIR /code
COPY uv.lock /code/uv.lock
COPY pyproject.toml /code/pyproject.toml
RUN uv pip compile pyproject.toml > requirements.txt
RUN uv pip install --system -r requirements.txt

COPY . .
ENV PYTHONPATH=/code
CMD ["bash", "/code/entrypoint.sh"]
