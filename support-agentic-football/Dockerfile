# このディレクトリをビルドコンテキストにして使う:
#   docker build -t agentic-football-support ./support-agentic-football

FROM node:24-slim

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

ENV PORT=8080

CMD ["node", "src/index.ts"]
