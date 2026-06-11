import Link from "next/link";
import { redirect } from "next/navigation";
import Navbar from "../components/Navbar";
import HostTabs from "./HostTabs";
import { getStaffSession } from "@/lib/auth";

export default async function HostLayout({ children }: { children: React.ReactNode }) {
  const staff = await getStaffSession();
  if (!staff) redirect("/login?next=/host/register");

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-3xl px-5 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Accueil participants</h1>
            <p className="text-sm text-muted mt-0.5">
              Enregistrement et gestion des QR codes.
            </p>
          </div>
          <HostTabs />
        </div>
        <div className="mt-6">{children}</div>
      </main>
    </div>
  );
}
