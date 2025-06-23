# 1. Этап установки зависимостей
# ИСПРАВЛЕНО: Используем стандартный образ `node:20` вместо `node:20-slim`
# Он больше по размеру, но содержит все необходимые системные библиотеки для Prisma.
FROM node:20 AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# 2. Этап сборки приложения
FROM node:20 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Генерация Prisma Client и сборка Next.js
RUN npx prisma generate
RUN npm run build

# 3. Финальный образ для запуска
FROM node:20 AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED 1

# Копируем оптимизированные файлы из сборщика
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Запускаем приложение с помощью правильной команды для standalone-режима
CMD ["node", "server.js"]
