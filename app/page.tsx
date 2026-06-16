import Link from "next/link";
import Image from "next/image";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ParticipantIdForm from "./components/ParticipantIdForm";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero branded — visuel officiel de l'événement en arrière-plan */}
      <section className="event-bg">
        <div className="mx-auto max-w-5xl px-5 py-12 sm:py-16 grid items-center gap-10 lg:grid-cols-2">
          <div className="text-white">
            <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-wide backdrop-blur">
              Side Event VivaTech · Libreville
            </span>
            <h1 className="mt-5 text-4xl sm:text-5xl font-extrabold leading-[1.05] tracking-tight">
              Accueillir, informer et{" "}
              <span className="text-[var(--accent)]">voter</span>
              <br className="hidden sm:block" /> sur une seule plateforme.
            </h1>
            <p className="mt-4 max-w-md text-base sm:text-lg text-white/85">
              18 &amp; 19 juin 2026 — enregistrement par QR, programme en direct et vote des stands.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/host/welcome" className="btn btn-accent">
                Écran d&apos;accueil
              </Link>
              <Link
                href="/login"
                className="btn bg-white/15 text-white backdrop-blur hover:bg-white/25"
              >
                Espace staff
              </Link>
            </div>
          </div>

          <div className="justify-self-center lg:justify-self-end">
            <Image
              src="/event-flyer.png"
              alt="Affiche officielle du Side Event VivaTech Libreville"
              width={420}
              height={420}
              priority
              className="w-64 sm:w-80 lg:w-[24rem] h-auto rounded-2xl border border-white/25 shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* Sélection du rôle */}
      <main className="mx-auto max-w-5xl px-5 py-12 sm:py-14">
        <span className="overline">Accès rapide</span>
        <h2 className="mt-2 text-2xl font-bold">Sélectionnez votre rôle</h2>

        <div className="mt-7 grid gap-5 sm:grid-cols-2 md:grid-cols-3">
          <Link
            href="/host/welcome"
            className="card group p-6 transition hover:-translate-y-0.5 hover:[box-shadow:var(--shadow-lift)]"
          >
            <span className="overline">Accueil · tablette</span>
            <h3 className="mt-3 text-lg font-semibold">Hôte / Hôtesse</h3>
            <p className="mt-1.5 text-sm text-muted">
              Afficher le QR d&apos;inscription dynamique et gérer les accès participants.
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
            <h3 className="mt-3 text-lg font-semibold">Organisateur</h3>
            <p className="mt-1.5 text-sm text-muted">
              Piloter l&apos;ouverture du vote et suivre les statistiques en direct.
            </p>
            <span className="mt-5 inline-block text-sm font-semibold text-primary group-hover:underline">
              Ouvrir →
            </span>
          </Link>

          <div className="card p-6 sm:col-span-2 md:col-span-1">
            <span className="overline">Portail · mobile</span>
            <h3 className="mt-3 text-lg font-semibold">Participant</h3>
            <p className="mt-1.5 text-sm text-muted">
              Scannez le QR remis à l&apos;accueil, ou saisissez votre ID.
            </p>
            <ParticipantIdForm />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
