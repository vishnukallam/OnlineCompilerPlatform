FROM node:20-bullseye

# Install system dependencies including Java
RUN apt-get update && \
    apt-get install -y \
    curl \
    wget \
    python3 \
    python3-pip \
    python3-dev \
    python3-venv \
    default-jdk \
    maven \
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
    python3-tk \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set Java environment variables explicitly
ENV JAVA_HOME=/usr/lib/jvm/default-java
ENV PATH="${JAVA_HOME}/bin:${PATH}"

# Verify Java and Maven installed correctly
RUN java -version && javac -version && mvn -version

# Download common Java JARs into a shared lib directory
RUN mkdir -p /usr/local/java/lib

RUN mvn dependency:get -Dartifact=org.json:json:20231013 -Ddest=/usr/local/java/lib && \
    mvn dependency:get -Dartifact=com.google.code.gson:gson:2.10.1 -Ddest=/usr/local/java/lib && \
    mvn dependency:get -Dartifact=org.apache.commons:commons-lang3:3.13.0 -Ddest=/usr/local/java/lib && \
    mvn dependency:get -Dartifact=org.apache.commons:commons-math3:3.6.1 -Ddest=/usr/local/java/lib && \
    mvn dependency:get -Dartifact=org.apache.commons:commons-collections4:4.4 -Ddest=/usr/local/java/lib && \
    mvn dependency:get -Dartifact=commons-io:commons-io:2.15.0 -Ddest=/usr/local/java/lib && \
    mvn dependency:get -Dartifact=commons-codec:commons-codec:1.16.0 -Ddest=/usr/local/java/lib && \
    mvn dependency:get -Dartifact=com.fasterxml.jackson.core:jackson-core:2.16.1 -Ddest=/usr/local/java/lib && \
    mvn dependency:get -Dartifact=com.fasterxml.jackson.core:jackson-databind:2.16.1 -Ddest=/usr/local/java/lib && \
    mvn dependency:get -Dartifact=com.fasterxml.jackson.core:jackson-annotations:2.16.1 -Ddest=/usr/local/java/lib && \
    mvn dependency:get -Dartifact=org.slf4j:slf4j-api:2.0.9 -Ddest=/usr/local/java/lib && \
    mvn dependency:get -Dartifact=junit:junit:4.13.2 -Ddest=/usr/local/java/lib && \
    mvn dependency:get -Dartifact=com.squareup.okhttp3:okhttp:4.12.0 -Ddest=/usr/local/java/lib && \
    mvn dependency:get -Dartifact=org.jsoup:jsoup:1.17.1 -Ddest=/usr/local/java/lib && \
    mvn dependency:get -Dartifact=com.google.guava:guava:32.1.3-jre -Ddest=/usr/local/java/lib && \
    mvn dependency:get -Dartifact=org.apache.httpcomponents:httpclient:4.5.14 -Ddest=/usr/local/java/lib && \
    mvn dependency:get -Dartifact=org.yaml:snakeyaml:2.2 -Ddest=/usr/local/java/lib && \
    mvn dependency:get -Dartifact=com.opencsv:opencsv:5.9 -Ddest=/usr/local/java/lib && \
    mvn dependency:get -Dartifact=org.postgresql:postgresql:42.7.1 -Ddest=/usr/local/java/lib && \
    mvn dependency:get -Dartifact=com.h2database:h2:2.2.224 -Ddest=/usr/local/java/lib && \
    mvn dependency:get -Dartifact=com.zaxxer:HikariCP:5.1.0 -Ddest=/usr/local/java/lib && \
    mvn dependency:get -Dartifact=com.github.ben-manes.caffeine:caffeine:3.1.8 -Ddest=/usr/local/java/lib && \
    mvn dependency:get -Dartifact=org.apache.commons:commons-text:1.11.0 -Ddest=/usr/local/java/lib && \
    mvn dependency:get -Dartifact=joda-time:joda-time:2.12.5 -Ddest=/usr/local/java/lib

# Set CLASSPATH so all JARs are auto-available when running java
ENV CLASSPATH="/usr/local/java/lib/*:."

# Create Python virtual environment
RUN python3 -m venv /opt/pyenv

# Install ALL common Python packages in the venv
RUN /opt/pyenv/bin/pip install --upgrade pip && \
    /opt/pyenv/bin/pip install \
    numpy \
    pandas \
    tensorflow \
    scipy \
    matplotlib \
    seaborn \
    plotly \
    scikit-learn \
    xgboost \
    lightgbm \
    statsmodels \
    nltk \
    textblob \
    requests \
    httpx \
    beautifulsoup4 \
    lxml \
    html5lib \
    openpyxl \
    xlrd \
    PyPDF2 \
    pypdf \
    python-docx \
    Pillow \
    imageio \
    sqlalchemy \
    pymongo \
    psycopg2-binary \
    tqdm \
    rich \
    click \
    colorama \
    tabulate \
    pydantic \
    python-dotenv \
    arrow \
    pytz \
    sympy \
    networkx \
    cryptography \
    bcrypt \
    aiohttp \
    fastapi \
    uvicorn \
    pytest \
    pyyaml \
    ujson \
    psutil \
    faker \
    humanize \
    more-itertools \
    toolz \
    qrcode \
    attrs \
    dataclasses-json

# Verify packages using venv python directly (not system python3)
RUN /opt/pyenv/bin/python3 -c "import numpy, pandas, scipy; print('Python packages OK')"

# Make venv python the system default AFTER verification
RUN ln -sf /opt/pyenv/bin/python3 /usr/local/bin/python3 && \
    ln -sf /opt/pyenv/bin/python3 /usr/local/bin/python && \
    ln -sf /opt/pyenv/bin/pip /usr/local/bin/pip3

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

RUN mkdir -p temp && chmod 777 temp

# Create directory for persistent user-installed packages
RUN mkdir -p /app/user_packages && chmod 777 /app/user_packages

# Configure PYTHONPATH to include the user_packages directory
# This ensures that any module installed there is importable by Python
ENV PYTHONPATH="/app/user_packages:${PYTHONPATH}"

EXPOSE 5000

CMD ["npm", "start"]
