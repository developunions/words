# Этап 1: Установка зависимостей
FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json ./
RUN npm install

# Этап 2: Сборка TypeScript в JavaScript
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Этап 3: Финальный образ для запуска
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 5000
CMD [ "node", "dist/server.js" ]