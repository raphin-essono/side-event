import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const STANDS = [
  {
    nom: "VOYAGEUR 241",
    tagline: "Tourisme & découverte numérique",
    description: "VOYAGEUR 241 valorise le tourisme gabonais à travers des outils digitaux innovants.",
    color: "oklch(0.68 0.17 140)",
    initials: "V2",
    ordre: 1,
  },
  {
    nom: "DUDUMA",
    tagline: "Solutions & services numériques",
    description: "DUDUMA présente ses solutions et services au service des entreprises et particuliers.",
    color: "oklch(0.58 0.2 240)",
    initials: "DU",
    ordre: 2,
  },
  {
    nom: "TROUVE-ICI",
    tagline: "Plateforme de mise en relation locale",
    description: "TROUVE-ICI connecte les besoins locaux aux offres de proximité via le numérique.",
    color: "oklch(0.70 0.19 75)",
    initials: "TI",
    ordre: 3,
  },
  {
    nom: "E-GARAME",
    tagline: "Innovation & solutions locales",
    description: "E-GARAME présente ses solutions et projets innovants au service du marché gabonais.",
    color: "oklch(0.55 0.22 290)",
    initials: "EG",
    ordre: 4,
  },
  {
    nom: "KOUMBAYA",
    tagline: "Impact social & numérique",
    description: "KOUMBAYA développe des solutions à fort impact social portées par le numérique.",
    color: "oklch(0.62 0.18 45)",
    initials: "KO",
    ordre: 5,
  },
  {
    nom: "SAMBA TECH PRO — ZIRA24",
    tagline: "Solutions technologiques professionnelles",
    description: "SAMBA TECH PRO accompagne les entreprises dans leur transformation numérique avec ZIRA24.",
    color: "oklch(0.72 0.18 195)",
    initials: "ST",
    ordre: 6,
  },
  {
    nom: "BÖÖH",
    tagline: "Tech & créativité",
    description: "BÖÖH explore l'intersection du numérique et du culturel à travers des projets innovants.",
    color: "oklch(0.6 0.2 25)",
    initials: "BH",
    ordre: 7,
  },
  {
    nom: "CHRIST-OF-FAIR MANDO",
    tagline: "Commerce & échange équitable",
    description: "CHRIST-OF-FAIR MANDO développe des solutions de commerce et d'échange équitable.",
    color: "oklch(0.52 0.22 310)",
    initials: "CM",
    ordre: 8,
  },
  {
    nom: "R&R TECH STUDIO",
    tagline: "Studio tech & développement",
    description: "R&R TECH STUDIO crée des expériences numériques et des applications sur mesure.",
    color: "oklch(0.50 0.21 268)",
    initials: "RR",
    ordre: 9,
  },
  {
    nom: "DART",
    tagline: "Tech & innovation",
    description: "DART présente ses solutions technologiques innovantes pour les marchés africains.",
    color: "oklch(0.65 0.17 155)",
    initials: "DA",
    ordre: 10,
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
