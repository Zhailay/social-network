FROM node:19.5.0-alpine

# Указываем нашу директорию
WORKDIR /app

# Скопировать package.json и package-lock.json внутрь контейнера

COPY package*.json ./

# Установка зависимости
RUN npm install

# Копируем оставшееся приложение в контейнер
COPY . .

# Установить Prisma
RUN npm install -g prisma

# Генерируем Prisma client
RUN prisma generate

# Копируем Prisma schema
COPY prisma/schema.prisma ./prisma/

# Открыть порт в нашем контейнере
EXPOSE 3000

# Запускаем сервер
CMD ["npm", "start"]