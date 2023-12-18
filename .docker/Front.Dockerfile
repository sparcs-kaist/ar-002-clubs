FROM node:20-alpine AS builder
ENV NODE_ENV production

WORKDIR /app

COPY ./front/package.json .
COPY ./front/package-lock.json .

RUN npm install --omit=dev

COPY ./front .

RUN npm run build

# Bundle static assets with nginx
FROM nginx:1.25.3-alpine as production
ENV NODE_ENV production
# Copy built assets from builder
COPY --from=builder /app/build /usr/share/nginx/html
# Add your nginx.conf
COPY ./.docker/nginx/nginx.conf /etc/nginx/conf.d/default.conf
# Start nginx
CMD ["nginx", "-g", "daemon off;"]