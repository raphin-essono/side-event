FROM node:18-alpine AS builder
WORKDIR /app
ENV NODE_ENV=production

# install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# build
COPY . .
RUN npm run build

FROM nginx:stable-alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html

# provide a SPA fallback
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
