#!/usr/bin/env bash
# Local development environment startup script
#
# Starts development environment using Docker Compose

# TO RUN ON WINDOWS:
# 1. Install WSL (Windows Subsystem for Linux) - https://learn.microsoft.com/en-us/windows/wsl/install
# 2. Install Docker Desktop - https://docs.docker.com/docker-for-windows/install/
# 3. Open WSL - `wsl`
# 4. Run this script - `./start-dev.sh`

# On Linux and macOS you can run this script directly - `./start-dev.sh`

set -a
source .env
set +a

# Parse command line arguments
START_ALL=false
WATCH_MODE=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --all)
      START_ALL=true
      shift
      ;;
    --watch)
      WATCH_MODE=true
      START_ALL=true
      shift
      ;;
    *)
      echo "Unknown option: $1"
      echo "Usage: $0 [--all] [--watch]"
      echo "  (no flags): Start database only"
      echo "  --all:      Start all services (web + database)"
      echo "  --watch:    Start all services with watch mode"
      exit 1
      ;;
  esac
done

# Validate DATABASE_URL exists
if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL is not set in .env file"
  exit 1
fi

# Extract DB info from DATABASE_URL and export for docker-compose
export DB_PASSWORD=$(echo "$DATABASE_URL" | awk -F':' '{print $3}' | awk -F'@' '{print $1}')
export DB_PORT=$(echo "$DATABASE_URL" | awk -F':' '{print $4}' | awk -F'/' '{print $1}')
export DB_NAME=$(echo "$DATABASE_URL" | awk -F'/' '{print $4}')

# Validate extracted values
if [ -z "$DB_PASSWORD" ] || [ -z "$DB_NAME" ]; then
  echo "ERROR: Could not parse DATABASE_URL. Expected format:"
  echo "postgresql://user:password@host:port/database"
  echo "Got: $DATABASE_URL"
  exit 1
fi

# Check if docker/podman is installed
if ! [ -x "$(command -v docker)" ] && ! [ -x "$(command -v podman)" ]; then
  echo -e "Docker or Podman is not installed. Please install docker and try again.\nDocker install guide: https://docs.docker.com/engine/install/"
  exit 1
fi

# Determine which docker command to use
if [ -x "$(command -v docker)" ]; then
  DOCKER_CMD="docker"
elif [ -x "$(command -v podman)" ]; then
  DOCKER_CMD="podman"
fi

# Check if docker daemon is running
if ! $DOCKER_CMD info > /dev/null 2>&1; then
  echo "$DOCKER_CMD daemon is not running. Please start $DOCKER_CMD and try again."
  exit 1
fi

# Check if docker compose is available
if ! $DOCKER_CMD compose version > /dev/null 2>&1; then
  echo "Docker Compose is not available. Please install Docker Compose and try again."
  exit 1
fi

# Check if port is already in use (skip if netcat not available)
if command -v nc >/dev/null 2>&1; then
  if nc -z localhost "$DB_PORT" 2>/dev/null; then
    echo "Port $DB_PORT is already in use. Checking if it's our container..."
    if [ "$($DOCKER_CMD compose ps -q postgres)" ]; then
      echo "Database is already running via Docker Compose."
      if [ "$START_ALL" = true ]; then
        echo "Starting web service..."
        if [ "$WATCH_MODE" = true ]; then
          $DOCKER_CMD compose up --watch
        else
          $DOCKER_CMD compose up -d
        fi
      fi
      exit 0
    else
      echo "Port is used by another process. Please free port $DB_PORT and try again."
      exit 1
    fi
  fi
fi

# Warn about default password
if [ "$DB_PASSWORD" = "password" ]; then
  echo "⚠️  WARNING: You are using the default database password!"
  read -p "Should we generate a random password for you? [y/N]: " -r REPLY
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Generate a random URL-safe password
    NEW_PASSWORD=$(openssl rand -base64 12 | tr '+/' '-_')
    if [[ "$(uname)" == "Darwin" ]]; then
      sed -i '' "s#:password@#:$NEW_PASSWORD@#" .env
    else
      sed -i "s#:password@#:$NEW_PASSWORD@#" .env
    fi
    echo "✅ Password updated in .env file. Please restart the script."
    exit 0
  else
    echo "⚠️  Continuing with default password (not recommended for production)"
  fi
fi

# Set USER_ID and GROUP_ID if not already set
if [ -z "$USER_ID" ]; then
  export USER_ID=$(id -u)
  echo "USER_ID=$USER_ID" >> .env
fi

if [ -z "$GROUP_ID" ]; then
  export GROUP_ID=$(id -g)
  echo "GROUP_ID=$GROUP_ID" >> .env
fi

# Start services
echo "Starting development environment..."

if [ "$START_ALL" = true ]; then
  if [ "$WATCH_MODE" = true ]; then
    echo "🚀 Starting all services with watch mode..."
    $DOCKER_CMD compose up --watch
  else
    echo "🚀 Starting all services..."
    $DOCKER_CMD compose up -d
    echo "✅ Services started. Run '$DOCKER_CMD compose logs -f' to view logs"
  fi
else
  echo "🗄️  Starting database only..."
  $DOCKER_CMD compose up -d postgres
  echo "✅ Database started on port $DB_PORT"
  echo "   Run '$0 --all' to start all services"
  echo "   Run '$0 --watch' to start with hot reload"
fi
