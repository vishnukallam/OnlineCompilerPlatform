FROM python:3.10-slim

RUN groupadd -r runner && useradd -r -g runner runner

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    python3-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY python_runner.py /usr/local/bin/python_runner.py
RUN chmod +x /usr/local/bin/python_runner.py && \
    chown -R runner:runner /app /usr/local/bin/python_runner.py

USER runner

CMD ["tail", "-f", "/dev/null"]
