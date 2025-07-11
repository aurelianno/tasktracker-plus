FROM node:18

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create non-root user for security (Debian/Ubuntu syntax)
RUN groupadd --gid 1001 --system nodejs
RUN useradd --uid 1001 --system --gid nodejs --shell /bin/bash --create-home tasktracker

# Change ownership of the app directory
RUN chown -R tasktracker:nodejs /app
USER tasktracker

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start the application
CMD ["npm", "start"]