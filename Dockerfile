# syntax=docker/dockerfile:1

############################
# Stage 1: Build with Bun
############################
FROM oven/bun:1 AS build

WORKDIR /app

COPY package.json ./

RUN bun install

# Copy source code
COPY . .

# Build the frontend/backend (if applicable)
RUN bun install

############################
# Stage 2: Runtime with Redis & MQTT Broker
############################
FROM oven/bun:1 AS runtime

# Install Mosquitto (MQTT broker) and Redis
RUN apt-get update && apt-get install -y mosquitto redis-server && \
    rm -rf /var/lib/apt/lists/*

# Configure Mosquitto with WebSocket + TCP
RUN mkdir -p /etc/mosquitto/conf.d
COPY mosquitto.conf /etc/mosquitto/mosquitto.conf

# Create app user
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

WORKDIR /app
COPY --from=build --chown=appuser:appgroup /app .

ENV NODE_ENV=production
USER appuser

# Expose ports
# 3000 -> Bun app
# 1883 -> MQTT (TCP)
# 9001 -> MQTT (WebSocket)
# 6379 -> Redis
EXPOSE 3000 1883 9001 6379

# Run all services: Redis, Mosquitto, and your Bun app
CMD redis-server --daemonize yes && \
    mosquitto -c /etc/mosquitto/mosquitto.conf -d && \
    bun run dev:ui
