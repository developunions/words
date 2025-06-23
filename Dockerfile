# 1. Этап установки зависимостей
# Используем стандартный образ `node:20`, который содержит все необходимые системные библиотеки.
FROM node:20 AS deps
WORKDIR /app
COPY package*.json ./
# Устанавливаем все зависимости, включая devDependencies
RUN npm install

# 2. Этап сборки приложения
FROM node:20 AS builder
WORKDIR /app
# Копируем зависимости из предыдущего этапа
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

# --- ИСПРАВЛЕНИЕ НАЧИНАЕТСЯ ЗДЕСЬ ---

# Копируем package.json, чтобы можно было запускать npm-скрипты типа "db:seed"
COPY --from=builder /app/package.json ./package.json

# Копируем только Prisma-клиент и CLI, необходимые для выполнения команд в работающем контейнере
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma

# Копируем схему Prisma, чтобы команда `seed` знала о структуре БД
COPY --from=builder /app/prisma ./prisma

# --- ИСПРАВЛЕНИЕ ЗАКАНЧИВАЕТСЯ ЗДЕСЬ ---

# Копируем оптимизированные файлы из сборщика
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Запускаем приложение
CMD ["node", "server.js"]

