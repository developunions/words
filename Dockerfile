# Dockerfile
FROM node:20-alpine AS base

WORKDIR /app

# Установка зависимостей
COPY package*.json ./
RUN npm install

# Копирование Prisma схемы
COPY prisma ./prisma/

# Генерация Prisma Client
RUN npx prisma generate

# Сборка приложения
COPY . .
RUN npm run build

# Финальный образ
FROM base AS runner
WORKDIR /app
COPY --from=base /app/next.config.ts ./
COPY --from=base /app/public ./public
COPY --from=base /app/.next ./.next
COPY --from=base /app/node_modules ./node_modules

CMD ["npm", "start"]