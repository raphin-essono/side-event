import ThemeToggle from "../../components/ThemeToggle";

type Props = {
  participant: { prenom: string; nom: string; fonction: string; email: string };
  voteCount: number;
};

export default function ParticipantHeader({ participant, voteCount }: Props) {
  const initials = `${participant.prenom[0] ?? ""}${participant.nom[0] ?? ""}`.toUpperCase();

  return (
    <header className="sticky top-0 z-20 text-white [background:var(--gradient-hero)] shadow-md">
      <div className="mx-auto max-w-2xl px-5 py-4 flex items-center gap-3.5">
        <span className="h-12 w-12 shrink-0 rounded-full bg-white/20 ring-2 ring-white/40 grid place-items-center font-bold text-base">
          {initials}
        </span>
        <div className="min-w-0 flex-1">
          <div className="font-semibold leading-tight truncate">
            {participant.prenom} {participant.nom}
          </div>
          <div className="text-xs text-white/75 truncate">{participant.fonction}</div>
          <div className="text-[11px] text-white/60 truncate">{participant.email}</div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold">
            {voteCount} vote(s)
          </span>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
