FROM apify/actor-node:18

# Copy package.json and package-lock.json first for better caching
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install --production

# Copy the rest of the code
COPY . ./

# Run the scraper
CMD ["npm", "start"]
