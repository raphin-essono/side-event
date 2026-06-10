FROM node:18-alpine AS deps
WORKDIR /app

# install deps (including dev for build)
COPY package.json package-lock.json ./
RUN npm ci

# generate prisma client if present
RUN if [ -f prisma/schema.prisma ]; then npx prisma generate || true; fi

COPY . .

# build TypeScript
RUN npm run build

# production image
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=deps /app/dist ./dist
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./package.json

EXPOSE 3001
ENV PORT=3001
CMD ["node", "dist/index.js"]
