export type TokenStatus = "ACTIF" | "UTILISE" | "REVOQUE";
export type VotePhaseStatus = "FERME" | "OUVERT";

export type ApiParticipant = {
  id: string;
  nom: string;
  prenom: string;
  fonction: string;
  email: string;
  createdAt: string;
};

export type ApiStand = {
  id: string;
  nom: string;
  description: string;
  tagline: string | null;
  logoUrl: string | null;
  color: string | null;
  initials: string | null;
  ordre: number;
  statutVote: VotePhaseStatus;
};

export type ApiPhase = {
  id: string;
  titre: string;
  horaire: string;
  salle: string | null;
  enCours: boolean;
  ordre: number;
};

export type ApiVote = {
  id: string;
  participantId: string;
  standId: string;
  noteGlobale: number;
  criteres: { innovation?: number; clarity?: number; impact?: number } | null;
  commentaire: string | null;
  votedAt: string;
};

export type RegisterResponse = {
  participant: ApiParticipant;
  token: { id: string; statut: TokenStatus };
  loginUrl: string;
  qrDataUrl: string;
};

export type SessionResponse = {
  participant: ApiParticipant;
  stands: ApiStand[];
  phases: ApiPhase[];
  settings: { voteOpenGlobal: boolean; votePhase: VotePhaseStatus };
  votes: ApiVote[];
};

export type StatsResponse = {
  participantCount: number;
  voteCount: number;
  stands: Array<{
    id: string;
    nom: string;
    voteCount: number;
    averageNote: number;
    statutVote: VotePhaseStatus;
  }>;
};
