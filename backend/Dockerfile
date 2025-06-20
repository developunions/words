# =======================================================
#  ФИНАЛЬНАЯ ВЕРСИЯ DOCKERFILE ДЛЯ BACKEND (v2)
# =======================================================

# Этап 1: Установка зависимостей
FROM node:18-alpine AS deps
WORKDIR /app
COPY backend/package.json backend/package-lock.json* ./
RUN npm install

# Этап 2: Сборка TypeScript в JavaScript
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY backend ./backend
COPY prisma ./prisma

# <<< НОВАЯ СТРОКА: Генерируем Prisma Client с нашими типами >>>
# Эта команда читает schema.prisma и создает типы Word, Level и т.д.
RUN npx prisma generate --schema=./prisma/schema.prisma

# Теперь запускаем сборку, которая теперь найдет все типы
RUN cd backend && npm run build

# Этап 3: Финальный образ для запуска
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/backend/dist ./
COPY backend/package.json ./
COPY --from=builder /app/prisma ./prisma

# Копируем скрипты, на случай если они понадобятся в production
COPY backend/scripts ./scripts
COPY backend/tsconfig.json ./

EXPOSE 5000
CMD [ "node", "server.js" ]