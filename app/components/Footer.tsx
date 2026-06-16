import Image from "next/image";

type Partner = { nom: string; sousTitre?: string; logo?: string; logoH?: number };

// Partenaires officiels — déposer les logos dans public/partners/ et renseigner `logo`.
const PARTNERS: Partner[] = [
  { nom: "AG Partners Publicis Africa", logo: "/partners/ag-partners.png", logoH: 72 },
  { nom: "AfricaTech Awards", logo: "/partners/africatech-awards.png", logoH: 52 },
  { nom: "SING SA", logo: "/partners/sing.png", logoH: 64 },
  { nom: "Airtel Gabon", logo: "/partners/airtel.png", logoH: 56 },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card/70 backdrop-blur">
      <div className="mx-auto max-w-5xl px-5 py-8">
        <p className="overline text-center">Nos partenaires</p>
        <ul className="mt-5 flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
          {PARTNERS.map((p) => (
            <li key={p.nom} className="text-center">
              {p.logo ? (
                <Image
                  src={p.logo}
                  alt={p.nom}
                  width={160}
                  height={p.logoH ?? 48}
                  className="h-12 w-auto object-contain"
                />
              ) : (
                <>
                  <span className="block text-sm font-bold tracking-tight">{p.nom}</span>
                  {p.sousTitre && (
                    <span className="block text-[11px] text-muted">{p.sousTitre}</span>
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
        <p className="mt-7 text-center text-xs text-muted">
          Side Event VivaTech · Libreville, Gabon — 18 &amp; 19 juin 2026 · Contact : 077 96 33 67
          / 074 13 71 03
        </p>
      </div>
    </footer>
  );
}
