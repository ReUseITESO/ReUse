FROM node:20-alpine

# Install compatibility libraries
RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY package.json package-lock.json ./

# Clean install with legacy support
RUN npm ci --legacy-peer-deps

COPY . .

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

EXPOSE 3000

CMD ["./entrypoint.sh"]