# Use an official Node.js runtime as the base image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the app dependencies
RUN npm install

# Copy the rest of the application to the working directory
COPY . .

RUN npx prisma generate

EXPOSE 5057

# Compile TypeScript to JavaScript
RUN npm run build

# Specify the command to run when the container starts
CMD [ "npm", "start" ]
