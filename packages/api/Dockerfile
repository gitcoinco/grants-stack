FROM node:18-slim

RUN apt-get update && apt-get install -y openssl libssl-dev
ENV NODE_OPTIONS=--max_old_space_size=8192

WORKDIR /app

COPY package.json yarn.lock prisma/ ./
RUN yarn install --production

COPY . .

RUN yarn prisma:generate
RUN yarn build

EXPOSE 3000

CMD ["yarn", "start"]