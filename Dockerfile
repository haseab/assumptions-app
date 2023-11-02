# Use an official Node.js alpine image as the base
FROM node:alpine

# Set the working directory in the container to /app
WORKDIR /app

# Copy package.json and yarn.lock into the directory
COPY package.json yarn.lock ./

# Install dependencies using yarn
RUN yarn install --frozen-lockfile

# Copy all other project files into the container
COPY . .

# Build the app using yarn
RUN yarn build

# Define the command to run the app using yarn
CMD ["yarn", "start"]
