FROM node:20-alpine AS builder
ENV NODE_ENV production

WORKDIR /app

COPY ./back/package.json .
COPY ./back/package-lock.json .

RUN npm install --omit=dev

COPY ./back .

CMD ["npm", "start"]