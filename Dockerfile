# Build Stage
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Vite application
RUN npm run build

# Production Stage - Nginx
FROM nginx:alpine

# Copy the built assets from the builder stage to Nginx's default public directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 (Cloud Run will route traffic to this port by default)
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
