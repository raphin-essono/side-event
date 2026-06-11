import Navbar from "../components/Navbar";
import ParticipantIdForm from "../components/ParticipantIdForm";

export default function ParticipantLanding() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-sm px-5 py-16">
        <span className="overline">Espace participant</span>
        <h1 className="mt-3 text-2xl font-bold">Scannez votre QR code</h1>
        <p className="mt-2 text-sm text-muted">
          Votre QR personnel vous a été remis à l&apos;accueil. Scannez-le avec l&apos;appareil
          photo de votre smartphone pour ouvrir votre espace.
        </p>
        <div className="card mt-8 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Ou saisissez votre ID
          </p>
          <ParticipantIdForm />
          <p className="mt-3 text-xs text-muted">
            En cas de problème, rapprochez-vous de l&apos;accueil pour obtenir un nouveau QR.
          </p>
        </div>
      </main>
    </div>
  );
}
