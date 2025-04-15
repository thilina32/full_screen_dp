# ✅ 1. Use official Node.js 20 LTS base image
FROM node:20

# ✅ 2. Set working directory inside container
WORKDIR /app

# ✅ 3. Copy only package files first (better caching)
COPY package*.json ./

# ✅ 4. Update existing npm packages
RUN npm update

# ✅ 5. Install dependencies
RUN npm install

# ✅ 6. Copy all remaining project files
COPY . .

# ✅ 7. Expose your app's port (adjust if different)
EXPOSE 3000

# ✅ 8. Run app with npm start
CMD ["npm", "start"]
