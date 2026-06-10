import type {
  ApiParticipant,
  RegisterResponse,
  SessionResponse,
  StatsResponse,
} from "./types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

let staffToken: string | null = null;

export function setStaffToken(token: string | null) {
  staffToken = token;
  if (token) localStorage.setItem("sing-staff-token", token);
  else localStorage.removeItem("sing-staff-token");
}

export function loadStaffToken() {
  staffToken = localStorage.getItem("sing-staff-token");
  return staffToken;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json");
  if (staffToken) headers.set("Authorization", `Bearer ${staffToken}`);

  const res = await fetch(`${API_URL}${path}`, { ...init, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? `Erreur API (${res.status})`);
  return data as T;
}

export const api = {
  health: () => request<{ status: string }>("/health"),

  loginStaff: (email: string, password: string) =>
    request<{ token: string; staff: { id: string; email: string; role: string } }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  registerParticipant: (body: {
    nom: string;
    prenom: string;
    fonction: string;
    email: string;
  }) =>
    request<RegisterResponse>("/api/participants/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  searchParticipants: (q: string) =>
    request<ApiParticipant[]>(`/api/participants?q=${encodeURIComponent(q)}`),

  regenerateQr: (participantId: string) =>
    request<RegisterResponse>(`/api/participants/${participantId}/regenerate-qr`, {
      method: "POST",
    }),

  openSession: (participantId: string, tokenId: string) =>
    request<SessionResponse>("/api/session/login", {
      method: "POST",
      body: JSON.stringify({ participantId, tokenId }),
    }),

  castVote: (body: {
    participantId: string;
    tokenId: string;
    standId: string;
    noteGlobale: number;
    criteres?: { innovation?: number; clarity?: number; impact?: number };
    commentaire?: string;
  }) =>
    request<{ message: string }>("/api/votes", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  getStats: () => request<StatsResponse>("/api/votes/stats"),

  toggleGlobalVote: (open: boolean) =>
    request("/api/settings/vote-global", {
      method: "PATCH",
      body: JSON.stringify({ open }),
    }),
};
