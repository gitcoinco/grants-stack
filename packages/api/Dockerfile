FROM node:18-alpine as base

WORKDIR /src
COPY package*.json /
EXPOSE 8000

FROM base as dev
ENV NODE_ENV=development
RUN npm install -g nodemon && npm install
COPY . /
CMD ["nodemon", "bin/www"]