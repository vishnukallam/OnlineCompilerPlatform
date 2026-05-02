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
    mvn dependency:get -Dartifact=ch.qos.logback:logback-classic:1.4.11 -Ddest=/usr/local/java/lib && \
    mvn dependency:get -Dartifact=org.apache.logging.log4j:log4j-core:2.22.0 -Ddest=/usr/local/java/lib && \
    mvn dependency:get -Dartifact=junit:junit:4.13.2 -Ddest=/usr/local/java/lib && \
    mvn dependency:get -Dartifact=org.junit.jupiter:junit-jupiter:5.10.1 -Ddest=/usr/local/java/lib && \
    mvn dependency:get -Dartifact=org.mockito:mockito-core:5.7.0 -Ddest=/usr/local/java/lib && \
    mvn dependency:get -Dartifact=com.squareup.okhttp3:okhttp:4.12.0 -Ddest=/usr/local/java/lib && \
    mvn dependency:get -Dartifact=org.jsoup:jsoup:1.17.1 -Ddest=/usr/local/java/lib && \
    mvn dependency:get -Dartifact=com.google.guava:guava:32.1.3-jre -Ddest=/usr/local/java/lib && \
    mvn dependency:get -Dartifact=org.projectlombok:lombok:1.18.30 -Ddest=/usr/local/java/lib && \
    mvn dependency:get -Dartifact=org.apache.httpcomponents:httpclient:4.5.14 -Ddest=/usr/local/java/lib && \
    mvn dependency:get -Dartifact=org.yaml:snakeyaml:2.2 -Ddest=/usr/local/java/lib && \
    mvn dependency:get -Dartifact=com.opencsv:opencsv:5.9 -Ddest=/usr/local/java/lib && \
    mvn dependency:get -Dartifact=org.apache.poi:poi:5.2.5 -Ddest=/usr/local/java/lib && \
    mvn dependency:get -Dartifact=org.apache.poi:poi-ooxml:5.2.5 -Ddest=/usr/local/java/lib && \
    mvn dependency:get -Dartifact=com.itextpdf:itextpdf:5.5.13.3 -Ddest=/usr/local/java/lib && \
    mvn dependency:get -Dartifact=org.bouncycastle:bcprov-jdk18on:1.77 -Ddest=/usr/local/java/lib && \
    mvn dependency:get -Dartifact=io.netty:netty-all:4.1.101.Final -Ddest=/usr/local/java/lib && \
    mvn dependency:get -Dartifact=org.hibernate:hibernate-core:6.4.1.Final -Ddest=/usr/local/java/lib && \
    mvn dependency:get -Dartifact=mysql:mysql-connector-java:8.0.33 -Ddest=/usr/local/java/lib && \
    mvn dependency:get -Dartifact=org.postgresql:postgresql:42.7.1 -Ddest=/usr/local/java/lib && \
    mvn dependency:get -Dartifact=com.h2database:h2:2.2.224 -Ddest=/usr/local/java/lib && \
    mvn dependency:get -Dartifact=redis.clients:jedis:5.1.0 -Ddest=/usr/local/java/lib && \
    mvn dependency:get -Dartifact=org.mongodb:mongodb-driver-sync:4.11.1 -Ddest=/usr/local/java/lib && \
    mvn dependency:get -Dartifact=com.zaxxer:HikariCP:5.1.0 -Ddest=/usr/local/java/lib && \
    mvn dependency:get -Dartifact=io.reactivex.rxjava3:rxjava:3.1.8 -Ddest=/usr/local/java/lib && \
    mvn dependency:get -Dartifact=io.projectreactor:reactor-core:3.6.1 -Ddest=/usr/local/java/lib && \
    mvn dependency:get -Dartifact=org.apache.kafka:kafka-clients:3.6.1 -Ddest=/usr/local/java/lib && \
    mvn dependency:get -Dartifact=com.rabbitmq:amqp-client:5.20.0 -Ddest=/usr/local/java/lib && \
    mvn dependency:get -Dartifact=org.quartz-scheduler:quartz:2.3.2 -Ddest=/usr/local/java/lib && \
    mvn dependency:get -Dartifact=net.sf.ehcache:ehcache:2.10.9.2 -Ddest=/usr/local/java/lib && \
    mvn dependency:get -Dartifact=com.github.ben-manes.caffeine:caffeine:3.1.8 -Ddest=/usr/local/java/lib && \
    mvn dependency:get -Dartifact=org.mapstruct:mapstruct:1.5.5.Final -Ddest=/usr/local/java/lib && \
    mvn dependency:get -Dartifact=com.google.inject:guice:7.0.0 -Ddest=/usr/local/java/lib && \
    mvn dependency:get -Dartifact=org.apache.commons:commons-text:1.11.0 -Ddest=/usr/local/java/lib && \
    mvn dependency:get -Dartifact=joda-time:joda-time:2.12.5 -Ddest=/usr/local/java/lib

# Set CLASSPATH so all JARs are auto-available when running java
ENV CLASSPATH="/usr/local/java/lib/*:."

# Install ALL common Python packages
RUN pip3 install --break-system-packages \
    numpy \
    pandas \
    scipy \
    matplotlib \
    seaborn \
    plotly \
    bokeh \
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

WORKDIR /app

ENV PIP_BREAK_SYSTEM_PACKAGES=1

COPY package*.json ./
RUN npm install --production

COPY . .

RUN mkdir -p temp && chmod 777 temp

EXPOSE 5000

CMD ["npm", "start"]
