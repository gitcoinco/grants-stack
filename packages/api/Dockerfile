FROM node:18-slim as base

RUN apt-get update && apt-get install -y openssl libssl-dev

WORKDIR /app

COPY package*.json .
COPY tsconfig.json .
COPY prisma/ prisma/
COPY src/ src/

FROM base as dev
ENV NODE_ENV=development
RUN npm install -g nodemon && npm install

EXPOSE 8000
CMD ["nodemon", "bin/www"]
