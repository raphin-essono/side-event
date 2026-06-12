import { redirect } from "next/navigation";
import Navbar from "../components/Navbar";
import LoginForm from "./LoginForm";
import { getStaffSession } from "@/lib/auth";

type Props = { searchParams: Promise<{ next?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const { next } = await searchParams;
  const target = next && next.startsWith("/") ? next : "/admin";

  const staff = await getStaffSession();
  if (staff) redirect(target);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-sm px-5 py-16">
        <h1 className="text-2xl font-bold">Espace staff</h1>
        <p className="mt-1.5 text-sm text-muted">
          Réservé aux hôtes et organisateurs SING.
        </p>
        <div className="mt-6">
          <LoginForm next={target} />
        </div>
      </main>
    </div>
  );
}
