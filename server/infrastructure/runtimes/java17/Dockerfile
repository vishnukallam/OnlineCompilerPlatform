FROM eclipse-temurin:17-jdk-focal

RUN groupadd -r appuser && useradd -r -g appuser appuser

WORKDIR /app
RUN chown -R appuser:appuser /app

USER appuser

CMD ["tail", "-f", "/dev/null"]
