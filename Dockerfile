FROM node:18-alpine

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json* ./

# Copy server package files
COPY server/package.json ./server/

# Install root UI dependencies
RUN npm install

# Install server dependencies
RUN cd server && npm install

# Copy all files
COPY . .

# Build Vite frontend
RUN npm run build

# Start the unified backend server which serves both API and static files
CMD ["npm", "start"]

EXPOSE 3001
