FROM node:22-alpine AS build-admin
WORKDIR /app

COPY admin/package.json admin/package-lock.json* ./
RUN npm install

COPY admin/ .
RUN npx nuxt generate

FROM node:22-alpine AS build-widget
WORKDIR /app

COPY widget/package.json widget/package-lock.json* ./
RUN npm install

COPY widget/ .
RUN node build.js

FROM nginx:alpine
COPY --from=build-admin /app/.output/public /usr/share/nginx/html
COPY --from=build-widget /app/index.html /usr/share/nginx/html/widget/index.html
COPY --from=build-widget /app/knock-knock.min.js /usr/share/nginx/html/widget/knock-knock.min.js
COPY deploy/admin-nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
