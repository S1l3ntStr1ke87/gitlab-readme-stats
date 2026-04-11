FROM oven/bun:1

WORKDIR /usr/src/app

COPY package.json .
RUN bun install

COPY . .

CMD ["bun", "src/express.ts"]