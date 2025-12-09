FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN mkdir -p public/uploads/assessment_files public/uploads/temp
ENV NODE_ENV=production
EXPOSE 3889
CMD ["node", "app.js"]
