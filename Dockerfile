# 1. Этап установки зависимостей
FROM node:20-alpine AS deps
WORKDIR /app
# Копируем package.json и package-lock.json
COPY package*.json ./
# Используем npm ci для быстрой и надежной установки
RUN npm ci

# 2. Этап сборки приложения
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Prisma требует эту переменную для корректной сборки под Alpine
ENV PRISMA_QUERY_ENGINE_BINARY="libquery_engine-linux-musl.so.node"

# Генерация Prisma Client и сборка Next.js
RUN npx prisma generate
RUN npm run build

# 3. Финальный, легковесный образ для запуска
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
# Отключаем телеметрию Next.js в продакшене
ENV NEXT_TELEMETRY_DISABLED 1

# ИСПРАВЛЕНИЕ: Устанавливаем OpenSSL 1.1 для совместимости с Prisma
RUN apk add --no-cache openssl1.1-compat

# Копируем оптимизированные файлы из сборщика
COPY --from=builder /app/public ./public

# Копируем standalone-вывод (включая server.js) и статичные файлы
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# ИСПРАВЛЕНИЕ: Запускаем приложение с помощью правильной команды для standalone-режима
CMD ["node", "server.js"]
