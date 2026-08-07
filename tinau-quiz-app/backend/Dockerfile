FROM node:18-alpine

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --prod --no-frozen-lockfile

COPY . .

RUN mkdir -p uploads

EXPOSE 5000

CMD ["node", "src/server.js"]
