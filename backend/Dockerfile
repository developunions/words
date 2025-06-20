# =======================================================
#  ФИНАЛЬНАЯ ВЕРСИЯ DOCKERFILE ДЛЯ BACKEND (v4 - с фиксом OpenSSL)
# =======================================================

# Этап 1: Установка ВСЕХ зависимостей
FROM node:18-alpine AS deps

# <<< НОВАЯ СТРОКА: Устанавливаем пакет совместимости для OpenSSL 1.1 >>>
RUN apk add openssl1.1-compat

WORKDIR /app
COPY backend/package.json backend/package-lock.json* ./
RUN npm install

# Этап 2: Сборка TypeScript в JavaScript
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY backend ./backend
COPY prisma ./prisma

RUN npx prisma generate --schema=./prisma/schema.prisma
RUN cd backend && npm run build

# Этап 3: Финальный образ для запуска
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# <<< НОВАЯ СТРОКА: Устанавливаем пакет совместимости и в финальный образ >>>
RUN apk add openssl1.1-compat

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/backend/dist ./
COPY backend/package.json ./
COPY --from=builder /app/prisma ./prisma
COPY backend/scripts ./scripts
COPY backend/tsconfig.json ./

EXPOSE 5000
CMD [ "node", "server.js" ]