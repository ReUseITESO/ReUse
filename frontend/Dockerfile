FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci
RUN npm install lucide-react --legacy-peer-deps

COPY . .
RUN chmod +x entrypoint.sh

EXPOSE 3000

CMD ["./entrypoint.sh"]
