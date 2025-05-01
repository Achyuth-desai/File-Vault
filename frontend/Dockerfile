FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy project files
COPY . .

# Set environment variables
ENV NODE_ENV=production
ENV REACT_APP_API_URL=http://localhost:8000/api

EXPOSE 3000

# Start the development server instead of building
CMD ["npm", "start"] 