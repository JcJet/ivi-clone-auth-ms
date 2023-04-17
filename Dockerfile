FROM node:alpine as development

RUN mkdir -p /app
WORKDIR /app

COPY . /app

RUN npm install

COPY . .

RUN npm run build

FROM node:alpine as production

ARG NODE_ENV=production

ENV NODE_ENV=${NODE_ENV}

RUN mkdir -p /app
WORKDIR /app

COPY . /app

RUN npm install

COPY . .

RUN npm run build

COPY --from=development /usr/src/app/dist ./dist

CMD ["node", "dist/apps/auth/main"]
