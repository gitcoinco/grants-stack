FROM node:18-slim as base

RUN apt-get update && apt-get install -y openssl libssl-dev

WORKDIR /app

COPY package.json yarn.lock ./
COPY prisma/ prisma/
COPY src/ src/
COPY bin/ bin/

ENV NODE_OPTIONS=--max_old_space_size=8192

FROM base as dev
ENV NODE_ENV=development

RUN yarn install

COPY . .

RUN yarn build

EXPOSE 8000

CMD ["yarn", "start"]