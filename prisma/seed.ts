import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const STANDS = [
  {
    nom: "Atelier IA Générative",
    tagline: "GenAI & assistants métier",
    description: "Démos d'agents et copilotes développés par SING pour le retail et la banque.",
    color: "oklch(0.72 0.17 195)",
    initials: "AI",
    ordre: 1,
  },
  {
    nom: "Data Platform",
    tagline: "Plateforme data temps réel",
    description: "Architecture lakehouse, observabilité et qualité des données.",
    color: "oklch(0.55 0.2 320)",
    initials: "DP",
    ordre: 2,
  },
  {
    nom: "Cyber & Trust",
    tagline: "Sécurité Zero Trust",
    description: "Détection, réponse et posture cloud expliquées par nos experts SOC.",
    color: "oklch(0.6 0.2 25)",
    initials: "CY",
    ordre: 3,
  },
  {
    nom: "Cloud Native",
    tagline: "K8s, FinOps, GreenOps",
    description: "Industrialisation cloud chez nos clients grands comptes.",
    color: "oklch(0.65 0.17 155)",
    initials: "CN",
    ordre: 4,
  },
  {
    nom: "Expérience Client",
    tagline: "Design & produit",
    description: "Du discovery au delivery: méthode et cas concrets.",
    color: "oklch(0.78 0.15 75)",
    initials: "UX",
    ordre: 5,
  },
  {
    nom: "Quantum Ready",
    tagline: "Recherche appliquée",
    description: "Veille et prototypes autour du quantique post-classique.",
    color: "oklch(0.5 0.2 268)",
    initials: "QR",
    ordre: 6,
  },
];

// Programme officiel — Side Event VivaTech Libreville 2026
// jour 1 = 18 juin · jour 2 = 19 juin. `salle` sert d'étiquette de catégorie.
const PROGRAM = [
  // ── Jour 1 (18 juin 2026) : Vision et solutions tech ──
  { jour: 1, horaire: "09h00–10h00", titre: "Accueil et installation des participants", salle: "Accueil", ordre: 1 },
  { jour: 1, horaire: "11h00–17h00", titre: "Ouverture des expositions et vernissage", salle: "Exposition", ordre: 2 },
  { jour: 1, horaire: "15h00–16h00", titre: "Atelier pratique 1 : Comment créer un agent IA ?", salle: "Atelier", ordre: 3 },
  { jour: 1, horaire: "16h00–17h00", titre: "Atelier pratique 2 : Comment sécuriser son agent IA ?", salle: "Atelier", ordre: 4 },
  { jour: 1, horaire: "17h00–17h05", titre: "Annonce des finalistes", salle: "Cérémonie", ordre: 5 },
  { jour: 1, horaire: "17h10", titre: "Fin de la journée", salle: null, ordre: 6 },

  // ── Jour 2 (19 juin 2026) : Expertise et discussion ──
  { jour: 2, horaire: "14h30–14h35", titre: "Mot de bienvenue et présentation du programme", salle: "Ouverture", ordre: 7 },
  { jour: 2, horaire: "14h40–14h55", titre: "Keynote 1 : Marketing digital à l'ère de l'IA", salle: "Keynote", ordre: 8 },
  { jour: 2, horaire: "14h55–15h10", titre: "Keynote 2 : Réglementation des réseaux sociaux : menaces et opportunités", salle: "Keynote", ordre: 9 },
  { jour: 2, horaire: "15h15–15h35", titre: "Immersion au Pavillon Afrique — Focus Innovation", salle: "Immersion", ordre: 10 },
  { jour: 2, horaire: "15h40–15h55", titre: "Keynote 3 : L'IA au cœur de la formation des talents locaux", salle: "Keynote", ordre: 11 },
  { jour: 2, horaire: "15h55–16h10", titre: "Keynote 4 : Exploiter le potentiel de l'IA pour améliorer le système de santé", salle: "Keynote", ordre: 12 },
  { jour: 2, horaire: "16h15–16h35", titre: "Pitchs des finalistes", salle: "Concours", ordre: 13 },
  { jour: 2, horaire: "16h35–16h45", titre: "Annonce du classement et remise des prix", salle: "Cérémonie", ordre: 14 },
  { jour: 2, horaire: "16h45–17h30", titre: "Cocktail et networking", salle: "Networking", ordre: 15 },
  { jour: 2, horaire: "17h30", titre: "Fin du SIDE Event", salle: null, ordre: 16 },
];

async function main() {
  await prisma.eventSettings.upsert({
    where: { id: 1 },
    create: { id: 1, voteOpenGlobal: false, votePhase: "FERME" },
    update: {},
  });

  for (const stand of STANDS) {
    await prisma.stand.upsert({
      where: { id: `seed-stand-${stand.ordre}` },
      create: { id: `seed-stand-${stand.ordre}`, ...stand, statutVote: "FERME" },
      update: stand,
    });
  }

  for (const phase of PROGRAM) {
    await prisma.phase.upsert({
      where: { id: `seed-phase-${phase.ordre}` },
      create: { id: `seed-phase-${phase.ordre}`, ...phase },
      update: phase,
    });
  }

  const { ADMIN_EMAIL, ADMIN_PASSWORD, HOST_EMAIL, HOST_PASSWORD } = process.env;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD || !HOST_EMAIL || !HOST_PASSWORD) {
    throw new Error(
      "Variables manquantes dans .env : ADMIN_EMAIL, ADMIN_PASSWORD, HOST_EMAIL, HOST_PASSWORD",
    );
  }

  const adminHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const hostHash = await bcrypt.hash(HOST_PASSWORD, 10);

  await prisma.staffUser.upsert({
    where: { email: ADMIN_EMAIL },
    create: { email: ADMIN_EMAIL, passwordHash: adminHash, role: "ADMIN", nom: "Admin SING" },
    update: { passwordHash: adminHash },
  });

  await prisma.staffUser.upsert({
    where: { email: HOST_EMAIL },
    create: { email: HOST_EMAIL, passwordHash: hostHash, role: "HOST", nom: "Accueil SING" },
    update: { passwordHash: hostHash },
  });

  console.log("Seed terminé : stands, programme, comptes staff.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
