#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "🚀 Installing Docker, Docker Compose, and Git on Amazon Linux 2023..."

# 1️⃣ Update system packages
sudo dnf update -y

# 2️⃣ Install Docker
sudo dnf install -y docker

# 3️⃣ Start & Enable Docker service
sudo systemctl start docker
sudo systemctl enable docker

# 4️⃣ Add current user to Docker group (avoids using `sudo` for Docker commands)
sudo usermod -aG docker $USER

# 5️⃣ Install Docker Compose
echo "🚀 Installing Docker Compose..."
sudo dnf install -y docker-compose-plugin

# 6️⃣ Install Git
echo "🚀 Installing Git..."
sudo dnf install -y git

# 7️⃣ Clone the GitHub repository
echo "🚀 Cloning the GitHub repository..."
git clone https://github.com/Vipul-26/graph-with-mongodb.git
cd graph-with-mongodb

# 8️⃣ Pull the Docker image from Docker Hub
echo "🚀 Pulling the latest Docker image from Docker Hub..."
docker pull vips26/graphqlwithmongodb:latest

# 9️⃣ Run the app using Docker Compose
echo "🚀 Starting the application using Docker Compose..."
docker compose down
docker compose up -d

# 🔟 Verify running containers
echo "✅ Running Docker Containers:"
docker ps

echo "🚀 Application deployment completed successfully!"
echo "📌 To check logs, run: docker compose logs -f"
echo "📌 To stop the app, run: docker compose down"

echo "⚠️ Please log out and log back in for the Docker group changes to take effect."
