# SING · VivaTech — Plateforme événementielle

Monorepo pour la plateforme décrite dans le [cahier des charges](./documentation/index.html).

## Structure

```
SING_INGRID_DOC/
├── backend/         # API REST — Express + Prisma + PostgreSQL (node_modules propre)
├── frontend/        # Application web — React + TanStack Start + Tailwind (node_modules propre)
├── documentation/   # CDC (cahier des charges) et docs projet
└── docker-compose.yml
```

Chaque projet (`frontend`, `backend`) est **indépendant** avec son propre `package.json` et `node_modules`.

## Démarrage rapide

### 1. Installer les dépendances (chaque projet séparément)

```powershell
cd frontend
npm install

cd ..\backend
npm install
```

Ou depuis la racine : `npm run install:all`

### 2. Base de données

```powershell
docker compose up -d
cd backend
copy .env.example .env
npm run db:push
npm run db:seed
```

### 3. Lancer l'API (port 3001)

```powershell
cd backend
npm run dev
```

### 4. Lancer le frontend (port 8080) — autre terminal

```powershell
cd frontend
npm run dev
```

## Rôles (CDC)

| Rôle | Route frontend | API |
|------|----------------|-----|
| Participant | `/m/$id` | Token QR, vote |
| Hôte / Hôtesse | `/host/*` | Participants, QR |
| Admin | `/admin` | Stands, vote, stats |
