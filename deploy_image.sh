#!/bin/bash

# ✅ Load environment variables from .env file
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# ✅ Ensure required variables are set
if [[ -z "$APP_IMAGE_NAME" || -z "$TAG" ]]; then
  echo "❌ Error: Missing required environment variables!"
  echo "Please define APP_IMAGE_NAME and TAG in your .env file."
  exit 1
fi

echo "🚀 Starting deployment..."

# Step 1: Build the Docker images
echo "🔨 Building Docker images..."
docker-compose build

# Step 2: Find the correct built image dynamically
IMAGE_ID=$(docker images -q ${APP_IMAGE_NAME}-app:${TAG})

if [ -z "$IMAGE_ID" ]; then
  echo "❌ Error: Built image not found! Exiting..."
  exit 1
fi

# Step 3: Authenticate with Docker Hub
echo "🔑 Authenticating with Docker Hub..."
echo "$DOCKER_ACCESS_TOKEN" | docker login --username "$DOCKER_USERNAME" --password-stdin || { echo "❌ Docker authentication failed!"; exit 1; }

# Step 4: Tag and Push the App Image
echo "🏷️ Tagging the app image..."
docker tag "$IMAGE_ID" "$DOCKER_USERNAME/$APP_IMAGE_NAME:$TAG"

echo "📤 Pushing the app image to Docker Hub..."
docker push "$DOCKER_USERNAME/$APP_IMAGE_NAME:$TAG"

# Step 5: Start the services using docker-compose
echo "🚀 Starting containers..."
docker-compose up -d

echo "✅ Deployment completed successfully!"
