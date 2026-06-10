import { createFileRoute, Link } from "@tanstack/react-router";
import { Smartphone } from "lucide-react";

export const Route = createFileRoute("/m/")({
  component: () => (
    <div className="min-h-screen grid place-items-center p-8 text-center">
      <div className="max-w-sm">
        <div className="h-14 w-14 mx-auto rounded-2xl bg-secondary grid place-items-center text-primary">
          <Smartphone className="h-6 w-6" />
        </div>
        <h1 className="mt-5 text-xl font-bold">Scannez votre QR</h1>
        <p className="mt-2 text-sm text-muted-foreground">Présentez-vous à l'accueil pour récupérer votre QR personnel et accéder à votre espace.</p>
        <Link to="/" className="mt-6 inline-block text-sm text-primary underline">Retour au menu</Link>
      </div>
    </div>
  ),
});
