FROM emscripten/emsdk:3.1.64

# Install Node.js & npm
RUN apt-get update && \
    apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs make && \
    rm -rf /var/lib/apt/lists/*

# Set working directory inside the container
WORKDIR /build
