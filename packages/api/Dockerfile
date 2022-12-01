FROM node:18-slim as base

RUN apt-get update && apt-get install -y openssl libssl-dev

WORKDIR /src
COPY package*.json /
COPY prisma ./prisma/

EXPOSE 8000

FROM base as dev
ENV NODE_ENV=development
RUN npm install -g nodemon && npm install

COPY . /
CMD ["nodemon", "bin/www"]
