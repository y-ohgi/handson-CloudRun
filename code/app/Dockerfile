FROM node:24-slim

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . ./

# Cloud Run が環境変数 PORT を注入します(既定 8080)。
# e.g.
# ENV PORT=8080
EXPOSE ${PORT:-8080}

# Node.js 24 の組み込み type stripping で TypeScript を直接実行する
# (型注釈を剥がすだけで、型チェックは行われない)
CMD ["node", "src/index.ts"]
