# 1. Этап установки зависимостей
FROM node:20-slim AS deps
WORKDIR /app
# Копируем package.json и package-lock.json
COPY package*.json ./
# Используем npm ci для быстрой и надежной установки
RUN npm ci

# 2. Этап сборки приложения
FROM node:20-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Генерация Prisma Client и сборка Next.js
RUN npx prisma generate
RUN npm run build

# 3. Финальный, легковесный образ для запуска
FROM node:20-slim AS runner
WORKDIR /app

# ИСПРАВЛЕНИЕ: Устанавливаем недостающую библиотеку libssl1.1
RUN apt-get update && apt-get install -y libssl1.1 && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
# Отключаем телеметрию Next.js в продакшене
ENV NEXT_TELEMETRY_DISABLED 1

# Копируем оптимизированные файлы из сборщика
COPY --from=builder /app/public ./public

# Копируем standalone-вывод (включая server.js) и статичные файлы
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Запускаем приложение с помощью правильной команды для standalone-режима
CMD ["node", "server.js"]
