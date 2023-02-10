FROM boudra/pnpm-node16:latest as base

RUN apt-get update && apt-get install -y openssl libssl-dev

WORKDIR /app

COPY package.json ./
COPY prisma/ prisma/
COPY src/ src/
COPY bin/ bin/

ENV NODE_OPTIONS=--max_old_space_size=8192

FROM base as dev
ENV NODE_ENV=development

RUN pnpm install

COPY . .

RUN pnpm run build

EXPOSE 8000

CMD ["pnpm", "start"]
