FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

USER node

CMD ["npx", "tsx", "watch", "src/server.ts"]
