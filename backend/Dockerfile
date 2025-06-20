# =======================================================
#  ФИНАЛЬНАЯ ВЕРСИЯ DOCKERFILE ДЛЯ BACKEND (с установкой OpenSSL)
# =======================================================

# Этап 1: Установка зависимостей
# Используем образ на базе Debian
FROM node:18-slim AS deps

# <<< НОВАЯ СТРОКА: Устанавливаем OpenSSL, чтобы Prisma работала >>>
RUN apt-get update && apt-get install -y openssl

WORKDIR /app
COPY backend/package.json backend/package-lock.json* ./
RUN npm install

# Этап 2: Сборка TypeScript в JavaScript
FROM node:18-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY backend ./backend
COPY prisma ./prisma

RUN npx prisma generate --schema=./prisma/schema.prisma
RUN cd backend && npm run build

# Этап 3: Финальный образ для запуска
FROM node:18-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# <<< НОВАЯ СТРОКА: Устанавливаем OpenSSL и в финальный образ >>>
RUN apt-get update && apt-get install -y openssl

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/backend/dist ./
COPY backend/package.json ./
COPY --from=builder /app/prisma ./prisma
COPY backend/scripts ./scripts
COPY backend/tsconfig.json ./

EXPOSE 5000
CMD [ "node", "server.js" ]