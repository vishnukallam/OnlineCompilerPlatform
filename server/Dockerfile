FROM node:20-bullseye

# Slim backend container
RUN apt-get update && \
    apt-get install -y curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Configure python pip to be able to install packages
ENV PIP_BREAK_SYSTEM_PACKAGES=1

COPY package*.json ./
RUN npm install --production

# Copy server files
COPY . .

# Create temp directory
RUN mkdir -p temp && chmod 777 temp

EXPOSE 5000

CMD ["npm", "start"]
