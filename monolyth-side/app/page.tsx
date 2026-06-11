import Link from "next/link";
import Navbar from "./components/Navbar";
import ParticipantIdForm from "./components/ParticipantIdForm";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-5xl px-5 py-14">
        <div className="max-w-2xl">
          <span className="overline">VivaTech · édition interne SING SA</span>
          <h1 className="mt-4 text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1]">
            Accueillir, informer et{" "}
            <span className="bg-clip-text text-transparent [background-image:var(--gradient-hero)]">
              voter
            </span>{" "}
            sur une seule plateforme.
          </h1>
          <p className="mt-4 text-lg text-muted">
            Sélectionnez votre rôle pour accéder à l&apos;écran correspondant.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          <Link
            href="/host/register"
            className="card group p-6 transition hover:-translate-y-0.5 hover:[box-shadow:var(--shadow-lift)]"
          >
            <span className="overline">Accueil · tablette</span>
            <h2 className="mt-3 text-lg font-semibold">Hôte / Hôtesse</h2>
            <p className="mt-1.5 text-sm text-muted">
              Enregistrer les participants à l&apos;accueil et générer leur QR code.
            </p>
            <span className="mt-5 inline-block text-sm font-semibold text-primary group-hover:underline">
              Ouvrir →
            </span>
          </Link>

          <Link
            href="/admin"
            className="card group p-6 transition hover:-translate-y-0.5 hover:[box-shadow:var(--shadow-lift)]"
          >
            <span className="overline">Pilotage · desktop</span>
            <h2 className="mt-3 text-lg font-semibold">Organisateur</h2>
            <p className="mt-1.5 text-sm text-muted">
              Piloter l&apos;ouverture du vote et suivre les statistiques en direct.
            </p>
            <span className="mt-5 inline-block text-sm font-semibold text-primary group-hover:underline">
              Ouvrir →
            </span>
          </Link>

          <div className="card p-6">
            <span className="overline">Portail · mobile</span>
            <h2 className="mt-3 text-lg font-semibold">Participant</h2>
            <p className="mt-1.5 text-sm text-muted">
              Scannez le QR remis à l&apos;accueil, ou saisissez votre ID.
            </p>
            <ParticipantIdForm />
          </div>
        </div>

      </main>
    </div>
  );
}
