FROM node:20-alpine

WORKDIR /app

COPY package.json ./
RUN npm install

COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src
COPY migrations ./migrations
COPY patches ./patches
COPY seeds ./seeds
COPY test ./test

RUN npm run build

EXPOSE 4000

CMD ["node", "dist/main.js"]
