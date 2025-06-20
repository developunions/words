# =================================================================
#  ФИНАЛЬНЫЙ DOCKERFILE ДЛЯ FRONTEND (Next.js на базе Debian)
# =================================================================

# Этап 1: Установка зависимостей
# Используем 'slim' версию Node.js на базе Debian для лучшей совместимости
FROM node:18-slim AS deps
WORKDIR /app

# Копируем файлы для установки зависимостей
# Использование * позволяет работать и с npm, и с yarn
COPY package.json package-lock.json* yarn.lock* ./
RUN npm install

# ---

# Этап 2: Сборка приложения
FROM node:18-slim AS builder
WORKDIR /app

# Копируем зависимости из предыдущего этапа
COPY --from=deps /app/node_modules ./node_modules
# Копируем остальной код проекта
COPY . .

# Собираем production-версию приложения
RUN npm run build

# ---

# Этап 3: Финальный образ для запуска
FROM node:18-slim AS runner
WORKDIR /app

# Устанавливаем окружение в "production"
ENV NODE_ENV=production

# Создаем специального пользователя с ограниченными правами для безопасности
# Это стандартная практика для production-образов.
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Копируем только необходимые для запуска файлы из этапа сборки
# Это ключевой шаг для уменьшения размера и повышения безопасности.
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Указываем, что приложение будет работать от имени нашего безопасного пользователя
USER nextjs

EXPOSE 3000
ENV PORT 3000

# Команда для запуска production-сервера Next.js
# Файл server.js создается автоматически при сборке Next.js в режиме 'standalone'
CMD ["node", "server.js"]