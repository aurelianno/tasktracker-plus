# Multi-stage build for optimized production image

# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S tasktracker -u 1001

# Change ownership
RUN chown -R tasktracker:nodejs /usr/share/nginx/html
RUN chown -R tasktracker:nodejs /var/cache/nginx
RUN chown -R tasktracker:nodejs /var/log/nginx
RUN chown -R tasktracker:nodejs /etc/nginx/conf.d
RUN touch /var/run/nginx.pid
RUN chown -R tasktracker:nodejs /var/run/nginx.pid

USER tasktracker

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]