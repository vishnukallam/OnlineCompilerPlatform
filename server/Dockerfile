FROM node:20-bullseye

RUN apt-get update && \
    apt-get install -y \
    curl \
    python3 \
    python3-pip \
    python3-dev \
    default-jdk \
    gcc \
    g++ \
    gfortran \
    libopenblas-dev \
    liblapack-dev \
    libssl-dev \
    libffi-dev \
    libxml2-dev \
    libxslt1-dev \
    libjpeg-dev \
    libpng-dev \
    libfreetype6-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install ALL common Python packages
RUN pip3 install --break-system-packages \
    # Core Scientific
    numpy \
    pandas \
    scipy \
    matplotlib \
    seaborn \
    plotly \
    bokeh \
    # Machine Learning
    scikit-learn \
    xgboost \
    lightgbm \
    statsmodels \
    # Deep Learning
    torch --index-url https://download.pytorch.org/whl/cpu \
    tensorflow-cpu \
    keras \
    # NLP
    nltk \
    spacy \
    textblob \
    # Data & Parsing
    requests \
    httpx \
    beautifulsoup4 \
    lxml \
    html5lib \
    scrapy \
    # File Formats
    openpyxl \
    xlrd \
    xlwt \
    PyPDF2 \
    pypdf \
    python-docx \
    Pillow \
    imageio \
    # Database
    sqlalchemy \
    pymongo \
    redis \
    psycopg2-binary \
    # Utilities
    tqdm \
    rich \
    click \
    typer \
    colorama \
    tabulate \
    pydantic \
    python-dotenv \
    arrow \
    pendulum \
    dateparser \
    pytz \
    # Math & Algorithms
    sympy \
    networkx \
    cvxpy \
    # Crypto & Security
    cryptography \
    pycryptodome \
    bcrypt \
    # Async
    aiohttp \
    asyncio \
    fastapi \
    uvicorn \
    # Testing
    pytest \
    hypothesis \
    # Other Popular
    pyyaml \
    toml \
    ujson \
    orjson \
    psutil \
    paramiko \
    fabric \
    celery \
    qrcode \
    barcode \
    faker \
    humanize \
    more-itertools \
    toolz \
    funcy \
    attrs \
    cattrs \
    dataclasses-json

WORKDIR /app

ENV PIP_BREAK_SYSTEM_PACKAGES=1

COPY package*.json ./
RUN npm install --production

COPY . .

RUN mkdir -p temp && chmod 777 temp

EXPOSE 5000

CMD ["npm", "start"]
