# SING · VivaTech — Plateforme événement

Application **Next.js monolithique** : pages web + API + base PostgreSQL dans un seul projet.
Couvre le [cahier des charges](./documentation/index.html) : enregistrement à l'accueil, QR codes, portail participant, vote des stands, pilotage admin.

## Stack

- **Next.js 16** (App Router) — pages et API routes
- **Prisma + PostgreSQL** — données
- **Tailwind CSS 4** — design system (thème clair/sombre)
- **Zod** — validation côté serveur

## Démarrage

```powershell
# 1. Base de données (Docker)
docker compose up -d db

# 2. Dépendances + schéma + données de démo
npm install
npm run db:setup

# 3. Lancer l'app
npm run dev
```

Application sur **http://localhost:3000**.

## Comptes staff

Les comptes organisateur et accueil sont créés par le seed à partir des variables du fichier `.env`
(`ADMIN_EMAIL`, `ADMIN_PASSWORD`, `HOST_EMAIL`, `HOST_PASSWORD`). Définissez des identifiants forts
et ne les committez jamais — `.env` est ignoré par Git.

## Parcours

1. **Hôte** (`/host/register`) : enregistre un participant → un QR code est généré.
2. **Participant** : scanne le QR (`/participants/{id}?t={token}`) → programme, stands, infos. Sa navbar affiche ses informations.
3. **Admin** (`/admin`) : ouvre le vote (globalement ou par stand), suit les stats en direct.
4. **Vote** : note globale 1–5 obligatoire, critères et commentaire optionnels, un seul vote par stand (contrôlé côté serveur).
5. **Perte d'accès** : l'hôte recherche le participant (`/host/search`) → « Nouveau QR » révoque les anciens tokens, les votes sont conservés.

## API

| Méthode | Route | Accès |
|---------|-------|-------|
| POST | `/api/auth/login` · `/api/auth/logout` | public / staff |
| GET, POST | `/api/participants` (paginé : `?q=&page=&pageSize=`) | staff |
| GET | `/api/participants/export` (CSV compatible Excel) | admin |
| GET | `/api/participants/:id` | staff |
| POST | `/api/participants/:id/regenerate-qr` | staff |
| POST | `/api/votes` | participant (token QR) |
| GET, POST | `/api/stands` | public / admin |
| PATCH, DELETE | `/api/stands/:id` | admin |
| PATCH | `/api/stands/:id/vote-status` | admin |
| PATCH | `/api/settings/vote-global` | admin |
| GET | `/api/health` | public |

## Structure

```
app/
├── page.tsx              # Accueil — choix du rôle
├── login/                # Connexion staff
├── host/                 # Accueil : enregistrer + rechercher (guard staff)
├── admin/                # Dashboard organisateur (guard admin)
├── participants/         # Espace participant (accès par token QR)
│   └── [id]/             # Portail + vote
├── api/                  # Routes API (auth, participants, votes, stands, settings)
└── components/           # Navbar, ThemeToggle, QRResult…
lib/
├── prisma.ts             # Client Prisma (singleton)
├── auth.ts               # Sessions staff (cookie signé HMAC)
├── tokens.ts             # Tokens QR : création, révocation, validation
└── api.ts                # Helpers API (json, erreurs, guard)
prisma/
├── schema.prisma         # Modèle de données (CDC)
└── seed.ts               # Stands, programme, comptes staff
documentation/            # CDC et docs projet
```

## Déploiement

CI/CD via GitHub Actions (`.github/workflows/deploy.yml`) — build Docker, push Docker Hub, deploy sur le serveur (`~/side-event`).
