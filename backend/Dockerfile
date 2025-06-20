# Этап 1: Установка ВСЕХ зависимостей (включая dev-зависимости)
FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install

# Этап 2: Сборка TypeScript в JavaScript
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Этап 3: Финальный образ для запуска (теперь с файлами для Prisma)
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Копируем ВСЕ зависимости (включая dev, нужные для Prisma CLI и ts-node)
COPY --from=deps /app/node_modules ./node_modules

# Копируем скомпилированный код приложения
COPY --from=builder /app/dist ./dist

# <<< НОВЫЕ СТРОКИ: Копируем файлы, нужные для Prisma и скриптов >>>
COPY package.json ./
COPY --from=builder /app/prisma ./prisma
COPY scripts ./scripts
COPY tsconfig.json ./

EXPOSE 5000

# Команда по умолчанию остается прежней - запуск веб-сервера
CMD [ "node", "dist/server.js" ]