# Stage 1: Use Node.js to build the React app
FROM node:18 AS build

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json, and install dependencies
COPY package.json .
COPY package-lock.json .
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the React app for production (CRA inlines REACT_APP_* variables at build time)
ARG REACT_APP_FIREBASE_API_KEY
ENV REACT_APP_FIREBASE_API_KEY=$REACT_APP_FIREBASE_API_KEY
RUN npm run build

# Stage 2: Use Nginx to serve the static files
FROM nginx:latest

# Copy the build output to the default Nginx public directory
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
