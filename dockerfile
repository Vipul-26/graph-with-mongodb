# ======= 1️⃣ Builder Stage: Install Dependencies =======
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy only package.json and package-lock.json first (leverages Docker cache)
COPY package*.json ./

# Install only production dependencies
RUN npm install --production

# Copy the rest of the application code
COPY . .

# ======= 2️⃣ Final Production Image =======
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy only necessary files from the builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app .

# Expose GraphQL API Port
EXPOSE 4000

# Load environment variables from the .env file
# This ensures the application picks up values dynamically at runtime
ENV NODE_ENV=${NODE_ENV}
ENV PORT=${PORT}
ENV MONGO_URI=${MONGO_URI}
ENV JWT_SECRET=${JWT_SECRET}

# Ensure the container runs as a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Start the GraphQL server
CMD ["node", "server.js"]
