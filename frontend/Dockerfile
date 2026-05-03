FROM node:18-alpine

WORKDIR /app

# Frontend üçün lazım olan faylları kopyalayırıq
COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]