FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN chmod +x entrypoint.sh

EXPOSE 3000

CMD ["./entrypoint.sh"]