FROM node:18

# Set working directory
WORKDIR /usr/src/app

# Copy package.json files and install dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy the rest of the code
COPY . ./

CMD ["npm", "start"]
