# リポジトリルートをビルドコンテキストにして使う:
#   docker build -f support/Dockerfile -t handson-support .

# --- ステージ1: HonKit で GitBook をビルドする ---
FROM node:24-slim AS book

WORKDIR /build

COPY package.json ./
RUN npm install

COPY . ./
RUN npx honkit build

# --- ステージ2: サポートアプリ本体 ---
FROM node:24-slim

WORKDIR /app

COPY support/package.json ./
RUN npm install

COPY support/ ./

# ビルド済み GitBook を同梱し、/book/ 配下で配信する
COPY --from=book /build/_book ./book

ENV PORT=8080
ENV BOOK_DIR=./book

CMD ["node", "src/index.ts"]
