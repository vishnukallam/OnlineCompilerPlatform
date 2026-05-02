FROM node:20-bullseye

# Install system dependencies including Java
RUN apt-get update && \
    apt-get install -y \
    curl \
    wget \
    python3 \
    python3-pip \
    python3-dev \
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
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set Java environment variables explicitly
ENV JAVA_HOME=/usr/lib/jvm/default-java
ENV PATH="${JAVA_HOME}/bin:${PATH}"

# Verify Java is installed correctly
RUN java -version && javac -version && mvn -version

# Download common Java JARs into a shared lib directory
RUN mkdir -p /usr/local/java/lib

# Download all common Java libraries via Maven
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

# Upgrade pip first
RUN pip3 install --upgrade pip --break-system-packages

# Install Python packages in small groups to avoid failures

# Group 1 - Core Scientific
RUN pip3 install --break-system-packages \
    numpy \
    pandas \
    scipy

# Group 2 - Visualization
RUN pip3 install --break-system-packages \
    matplotlib \
    seaborn \
    plotly

# Group 3 - Machine Learning
RUN pip3 install --break-system-packages \
    scikit-learn \
    xgboost \
    lightgbm \
    statsmodels

# Group 4 - NLP
RUN pip3 install --break-system-packages \
    nltk \
    textblob

# Group 5 - Web & HTTP
RUN pip3 install --break-system-packages \
    requests \
    httpx \
    beautifulsoup4 \
    lxml \
    html5lib

# Group 6 - File formats
RUN pip3 install --break-system-packages \
    openpyxl \
    xlrd \
    PyPDF2 \
    pypdf \
    python-docx \
    Pillow \
    imageio

# Group 7 - Database
RUN pip3 install --break-system-packages \
    sqlalchemy \
    pymongo \
    psycopg2-binary

# Group 8 - Utilities
RUN pip3 install --break-system-packages \
    tqdm \
    rich \
    click \
    colorama \
    tabulate \
    pydantic \
    python-dotenv \
    pytz \
    psutil \
    pyyaml \
    ujson

# Group 9 - Math & Other
RUN pip3 install --break-system-packages \
    sympy \
    networkx \
    arrow \
    faker \
    humanize \
    more-itertools \
    toolz \
    qrcode \
    attrs \
    dataclasses-json

# Group 10 - Security & Async
RUN pip3 install --break-system-packages \
    cryptography \
    bcrypt \
    aiohttp \
    fastapi \
    uvicorn \
    pytest

WORKDIR /app

ENV PIP_BREAK_SYSTEM_PACKAGES=1

COPY package*.json ./
RUN npm install --production

COPY . .

RUN mkdir -p temp && chmod 777 temp

EXPOSE 5000

CMD ["npm", "start"]
