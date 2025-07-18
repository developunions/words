# 1. Этап установки зависимостей
# ИСПРАВЛЕНО: Используем node:18, который основан на Debian Bullseye.
# Эта версия Debian использует OpenSSL 1.1.x, для которого у Prisma ЕСТЬ нужные бинарные файлы.
FROM node:18 AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install

# 2. Этап сборки приложения
FROM node:18 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Теперь эта команда должна сработать, так как ОС и Prisma совместимы
RUN npx prisma generate
RUN npm run build

# 3. Финальный образ для запуска
FROM node:18 AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED 1

# Копируем все необходимые для запуска файлы
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/data ./data
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/tsconfig.scripts.json ./tsconfig.scripts.json

CMD ["npm", "start"]