# 1. Этап установки зависимостей
FROM node:20 AS deps
WORKDIR /app
COPY package*.json ./
# Устанавливаем все зависимости, включая devDependencies
RUN npm install

# 2. Этап сборки приложения
FROM node:20 AS builder
WORKDIR /app
# Копируем уже установленные зависимости
COPY --from=deps /app/node_modules ./node_modules
# Копируем весь исходный код
COPY . .

# Генерация Prisma Client и сборка Next.js
RUN npx prisma generate
RUN npm run build

# 3. Финальный образ для запуска
FROM node:20 AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Копируем всё необходимое для запуска приложения и сидов
COPY --from=builder /app/package.json           ./package.json
COPY --from=builder /app/node_modules           ./node_modules
COPY --from=builder /app/.next                  ./.next
COPY --from=builder /app/public                 ./public
COPY --from=builder /app/prisma                 ./prisma
COPY --from=builder /app/scripts                ./scripts
COPY --from=builder /app/data                   ./data
COPY --from=builder /app/tsconfig.json          ./tsconfig.json
COPY --from=builder /app/tsconfig.scripts.json  ./tsconfig.scripts.json

# Запуск приложения
CMD ["npm", "start"]
