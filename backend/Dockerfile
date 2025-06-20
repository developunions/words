# =======================================================
#  ФИНАЛЬНАЯ ВЕРСИЯ DOCKERFILE ДЛЯ BACKEND (MONOREPO)
# =======================================================

# Этап 1: Установка зависимостей
FROM node:18-alpine AS deps
WORKDIR /app
# Контекст сборки теперь корень проекта, поэтому указываем полный путь
COPY backend/package.json backend/package-lock.json* ./
RUN npm install

# Этап 2: Сборка TypeScript в JavaScript
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
# Копируем папку backend и папку prisma
COPY backend ./backend
COPY prisma ./prisma
# Запускаем сборку, находясь в папке backend
RUN cd backend && npm run build

# Этап 3: Финальный образ для запуска
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Копируем зависимости
COPY --from=deps /app/node_modules ./node_modules

# Копируем скомпилированный код из папки dist бэкенда
COPY --from=builder /app/backend/dist ./dist

# Копируем файлы, нужные для Prisma и для запуска скриптов
COPY backend/package.json ./
COPY --from=builder /app/prisma ./prisma
COPY backend/scripts ./scripts
COPY backend/tsconfig.json ./

EXPOSE 5000
CMD [ "node", "dist/server.js" ]