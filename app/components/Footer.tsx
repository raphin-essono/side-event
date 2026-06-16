// Partenaires officiels du Side Event VivaTech Libreville.
// Pour afficher de vrais logos : déposer les fichiers dans public/partners/
// puis renseigner `logo` (ex. "/partners/airtel.png").
const PARTNERS: { nom: string; sousTitre?: string; logo?: string }[] = [
  { nom: "AG Partners", sousTitre: "Publics Africa" },
  { nom: "AriaTech Award" },
  { nom: "SING", sousTitre: "Société d'Incubation Numérique du Gabon" },
  { nom: "Airtel", sousTitre: "Gabon" },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card/70 backdrop-blur">
      <div className="mx-auto max-w-5xl px-5 py-8">
        <p className="overline text-center">Nos partenaires</p>
        <ul className="mt-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-5">
          {PARTNERS.map((p) => (
            <li key={p.nom} className="text-center">
              <span className="block text-sm font-bold tracking-tight">{p.nom}</span>
              {p.sousTitre && (
                <span className="block text-[11px] text-muted">{p.sousTitre}</span>
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
