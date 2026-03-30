FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci
RUN npm install lucide-react --legacy-peer-deps

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
