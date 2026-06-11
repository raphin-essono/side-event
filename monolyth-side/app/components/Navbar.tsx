import Link from "next/link";
import { getStaffSession } from "@/lib/auth";
import ThemeToggle from "./ThemeToggle";
import LogoutButton from "./LogoutButton";

export default async function Navbar() {
  const staff = await getStaffSession();

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-card/85 backdrop-blur">
      <div className="mx-auto max-w-5xl px-5 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="leading-tight">
          <span className="block font-bold tracking-tight">
            SING <span className="text-primary">· VivaTech</span>
          </span>
          <span className="block text-[11px] text-muted tracking-wide">
            Plateforme événement
          </span>
        </Link>

        <nav className="flex items-center gap-3">
          {staff ? (
            <>
              <span className="hidden sm:flex flex-col items-end leading-tight">
                <span className="text-xs font-semibold">{staff.nom ?? staff.email}</span>
                <span className="badge badge-accent mt-0.5">
                  {staff.role === "ADMIN" ? "Organisateur" : "Accueil"}
                </span>
              </span>
              <LogoutButton />
            </>
          ) : (
            <Link href="/login" className="text-sm font-medium text-primary hover:underline">
              Espace staff
            </Link>
          )}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
