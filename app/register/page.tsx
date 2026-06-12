import Link from "next/link";
import { consumeRegistrationCode, createRegistrationTicket } from "@/lib/registration";
import RegisterForm from "./RegisterForm";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ c?: string }> };

function InvalidCode() {
  return (
    <main className="mx-auto max-w-sm px-5 py-20 text-center">
      <span className="badge badge-closed">Code invalide</span>
      <h1 className="mt-4 text-xl font-bold">Ce QR n&apos;est plus valable</h1>
      <p className="mt-2 text-sm text-muted">
        Chaque QR d&apos;accueil est à usage unique et change après chaque scan. Scannez le QR
        affiché à l&apos;écran d&apos;accueil de l&apos;événement.
      </p>
      <Link href="/participants" className="btn mt-6 inline-flex">
        Retour
      </Link>
    </main>
  );
}

export default async function RegisterPage({ searchParams }: Props) {
  const { c } = await searchParams;
  if (!c) return <InvalidCode />;

  // Le scan consomme le code (usage unique) : l'écran d'accueil
  // détecte le changement et affiche immédiatement un nouveau QR.
  const consumed = await consumeRegistrationCode(c);
  if (!consumed) return <InvalidCode />;

  const ticket = createRegistrationTicket(c);

  return (
    <div className="min-h-screen pb-12">
      <header className="text-white [background:var(--gradient-hero)] shadow-md">
        <div className="mx-auto max-w-2xl px-5 py-6">
          <div className="overline text-white/70">Side Event SING</div>
          <h1 className="text-xl font-bold leading-tight mt-1">Bienvenue !</h1>
          <p className="text-sm text-white/80 mt-1">
            Renseignez vos informations pour accéder à la plateforme.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-5 pt-6">
        <RegisterForm ticket={ticket} />
        <p className="mt-4 text-xs text-muted text-center">
          Ne fermez pas cette page avant d&apos;avoir validé le formulaire — en cas de problème,
          rapprochez-vous de l&apos;accueil.
        </p>
      </main>
    </div>
  );
}
