FROM node:24-slim

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . ./

# Cloud Run が環境変数 PORT を注入します(既定 8080)。
# 公式の container contract により、コンテナ側で PORT を設定してはいけません。
# ローカルの docker run では未設定になるため、アプリ側で 8080 にフォールバックしています。

CMD ["node", "src/index.ts"]
