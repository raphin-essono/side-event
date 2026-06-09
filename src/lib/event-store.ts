import { useEffect, useState, useSyncExternalStore } from "react";

export type Participant = {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  email: string;
  token: string;
  createdAt: number;
};

export type Vote = {
  participantId: string;
  standId: string;
  global: number;
  innovation: number;
  clarity: number;
  impact: number;
  comment: string;
  at: number;
};

export type Stand = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  color: string;
  initials: string;
};

export type State = {
  participants: Participant[];
  votes: Vote[];
  voteOpenGlobal: boolean;
  standsOpen: Record<string, boolean>;
};

const KEY = "sing-vivatech-state-v1";

export const STANDS: Stand[] = [
  { id: "s1", name: "Atelier IA Générative", tagline: "GenAI & assistants métier", description: "Démos d'agents et copilotes développés par SING pour le retail et la banque.", color: "oklch(0.72 0.17 195)", initials: "AI" },
  { id: "s2", name: "Data Platform", tagline: "Plateforme data temps réel", description: "Architecture lakehouse, observabilité et qualité des données.", color: "oklch(0.55 0.2 320)", initials: "DP" },
  { id: "s3", name: "Cyber & Trust", tagline: "Sécurité Zero Trust", description: "Détection, réponse et posture cloud expliquées par nos experts SOC.", color: "oklch(0.6 0.2 25)", initials: "CY" },
  { id: "s4", name: "Cloud Native", tagline: "K8s, FinOps, GreenOps", description: "Industrialisation cloud chez nos clients grands comptes.", color: "oklch(0.65 0.17 155)", initials: "CN" },
  { id: "s5", name: "Expérience Client", tagline: "Design & produit", description: "Du discovery au delivery: méthode et cas concrets.", color: "oklch(0.78 0.15 75)", initials: "UX" },
  { id: "s6", name: "Quantum Ready", tagline: "Recherche appliquée", description: "Veille et prototypes autour du quantique post-classique.", color: "oklch(0.5 0.2 268)", initials: "QR" },
];

const initialState: State = {
  participants: [],
  votes: [],
  voteOpenGlobal: false,
  standsOpen: Object.fromEntries(STANDS.map(s => [s.id, false])),
};

let state: State = load();
const listeners = new Set<() => void>();

function load(): State {
  if (typeof window === "undefined") return initialState;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initialState;
    return { ...initialState, ...JSON.parse(raw) };
  } catch { return initialState; }
}

function persist() {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(state));
  listeners.forEach(l => l());
}

function setState(updater: (s: State) => State) {
  state = updater(state);
  persist();
}

export function useEventStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    () => selector(state),
    () => selector(initialState),
  );
}

// hydrate after mount to avoid SSR mismatch
export function useHydrated() {
  const [h, setH] = useState(false);
  useEffect(() => { state = load(); setH(true); listeners.forEach(l => l()); }, []);
  return h;
}

function uid(prefix = "") {
  return prefix + Math.random().toString(36).slice(2, 8).toUpperCase();
}

export const actions = {
  register(p: Omit<Participant, "id" | "token" | "createdAt">): Participant {
    const np: Participant = { ...p, id: uid("P-"), token: uid(""), createdAt: Date.now() };
    setState(s => ({ ...s, participants: [np, ...s.participants] }));
    return np;
  },
  regenerateToken(id: string): Participant | null {
    let updated: Participant | null = null;
    setState(s => ({
      ...s,
      participants: s.participants.map(p => {
        if (p.id !== id) return p;
        updated = { ...p, token: uid("") };
        return updated;
      }),
    }));
    return updated;
  },
  getParticipant(id: string) { return state.participants.find(p => p.id === id) || null; },
  castVote(v: Vote) {
    setState(s => ({ ...s, votes: [...s.votes.filter(x => !(x.participantId === v.participantId && x.standId === v.standId)), v] }));
  },
  toggleStand(id: string, open?: boolean) {
    setState(s => ({ ...s, standsOpen: { ...s.standsOpen, [id]: open ?? !s.standsOpen[id] } }));
  },
  toggleGlobal(open?: boolean) {
    setState(s => {
      const next = open ?? !s.voteOpenGlobal;
      return { ...s, voteOpenGlobal: next, standsOpen: Object.fromEntries(STANDS.map(st => [st.id, next])) };
    });
  },
  reset() { setState(() => initialState); },
};

export function hasVoted(participantId: string, standId: string) {
  return state.votes.some(v => v.participantId === participantId && v.standId === standId);
}

export const PROGRAM = [
  { time: "09:30", title: "Accueil café & enregistrement", room: "Hall principal" },
  { time: "10:00", title: "Keynote: SING & l'IA d'entreprise", room: "Auditorium" },
  { time: "11:00", title: "Table ronde: Data & Trust", room: "Salle Galilée" },
  { time: "12:30", title: "Déjeuner networking", room: "Rooftop" },
  { time: "14:00", title: "Démos sur les stands", room: "Village SING" },
  { time: "16:00", title: "Ouverture des votes", room: "Village SING" },
  { time: "17:30", title: "Remise des prix & cocktail", room: "Auditorium" },
];
