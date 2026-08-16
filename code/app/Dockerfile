FROM node:24-slim

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . ./

# Cloud Run は環境変数 PORT でリッスンすべきポートを渡してくる(デフォルト 8080)
ENV PORT=8080

# Node.js 24 は TypeScript をそのまま実行できる(型を剥がして実行される)
CMD ["node", "src/index.ts"]
