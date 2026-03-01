FROM node:22-alpine AS build
WORKDIR /app

COPY admin/package.json admin/package-lock.json* ./
RUN npm install

COPY admin/ .
RUN npx nuxt generate

FROM nginx:alpine
COPY --from=build /app/.output/public /usr/share/nginx/html
COPY deploy/admin-nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
