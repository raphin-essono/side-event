# ── Build ────────────────────────────────────────────────────────
# Next.js 16 requiert Node >= 20
FROM node:22-alpine AS builder
WORKDIR /app

# Dépendances complètes : les devDependencies (TypeScript, Tailwind…)
# sont nécessaires pour `next build`
COPY package*.json ./
RUN npm ci

# Sources — les secrets (.env*) et la base SQLite locale sont exclus
# via .dockerignore
COPY . .

RUN npx prisma generate
RUN npm run build

# Ne garder que les dépendances de production, puis régénérer le
# client Prisma (npm prune peut supprimer node_modules/.prisma)
RUN npm prune --omit=dev && npx prisma generate

# ── Run ──────────────────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/next.config.ts ./

# La configuration (DATABASE_URL, AUTH_SECRET…) est fournie à
# l'exécution : docker run --env-file ou variables d'environnement
EXPOSE 3000
ENV PORT=3000
CMD ["node", "node_modules/next/dist/bin/next", "start"]
