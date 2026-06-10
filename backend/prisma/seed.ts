import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient, StaffRole, VotePhaseStatus } from "@prisma/client";

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

const PROGRAM = [
  { horaire: "09:30", titre: "Accueil café & enregistrement", salle: "Hall principal", ordre: 1 },
  { horaire: "10:00", titre: "Keynote: SING & l'IA d'entreprise", salle: "Auditorium", ordre: 2 },
  { horaire: "11:00", titre: "Table ronde: Data & Trust", salle: "Salle Galilée", ordre: 3 },
  { horaire: "12:30", titre: "Déjeuner networking", salle: "Rooftop", ordre: 4 },
  { horaire: "14:00", titre: "Démos sur les stands", salle: "Village SING", ordre: 5 },
  { horaire: "16:00", titre: "Ouverture des votes", salle: "Village SING", ordre: 6, enCours: true },
  { horaire: "17:30", titre: "Remise des prix & cocktail", salle: "Auditorium", ordre: 7 },
];

async function main() {
  await prisma.eventSettings.upsert({
    where: { id: 1 },
    create: { id: 1, voteOpenGlobal: false, votePhase: VotePhaseStatus.FERME },
    update: {},
  });

  for (const stand of STANDS) {
    await prisma.stand.upsert({
      where: { id: `seed-stand-${stand.ordre}` },
      create: { id: `seed-stand-${stand.ordre}`, ...stand, statutVote: VotePhaseStatus.FERME },
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

  const adminHash = await bcrypt.hash(process.env.ADMIN_PASSWORD ?? "admin123", 10);
  const hostHash = await bcrypt.hash(process.env.HOST_PASSWORD ?? "host123", 10);

  await prisma.staffUser.upsert({
    where: { email: process.env.ADMIN_EMAIL ?? "admin@sing.ga" },
    create: {
      email: process.env.ADMIN_EMAIL ?? "admin@sing.ga",
      passwordHash: adminHash,
      role: StaffRole.ADMIN,
      nom: "Admin SING",
    },
    update: { passwordHash: adminHash },
  });

  await prisma.staffUser.upsert({
    where: { email: process.env.HOST_EMAIL ?? "host@sing.ga" },
    create: {
      email: process.env.HOST_EMAIL ?? "host@sing.ga",
      passwordHash: hostHash,
      role: StaffRole.HOST,
      nom: "Accueil SING",
    },
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
