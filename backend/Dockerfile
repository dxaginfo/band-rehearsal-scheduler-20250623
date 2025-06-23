FROM node:18-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 4000

# Start the application
CMD ["npm", "start"]
