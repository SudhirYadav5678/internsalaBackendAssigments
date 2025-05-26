# Use official Node.js runtime as base image
FROM node:20

# Set working directory inside the container
WORKDIR /src

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the app source code
COPY . .

# Expose the port your app will run on
EXPOSE 8000

# Command to run your app
CMD ["npm", "dev"]