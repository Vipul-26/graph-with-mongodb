# Use an official Node.js runtime as the base image
FROM node:18-alpine AS builder

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if it exists) to install dependencies
COPY package*.json ./

# Install dependencies
RUN npm install --production --no-strict-ssl

# Copy the rest of the application code
COPY . .

# Stage 2: Create a lightweight production image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy only the necessary files from the builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app .

# Expose the port your GraphQL server runs on (default is 4000 for Apollo Server)
EXPOSE 4000

# Environment variables (can be overridden via docker-compose or runtime)
ENV NODE_ENV=production
ENV PORT=4000

# Command to start the application
CMD ["npm", "start"]