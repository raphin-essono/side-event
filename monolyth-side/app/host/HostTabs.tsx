"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/host/welcome", label: "QR d'accueil" },
  { href: "/host/register", label: "Saisie manuelle" },
  { href: "/host/search", label: "Rechercher" },
];

export default function HostTabs() {
  const pathname = usePathname();
  return (
    <nav className="card flex gap-1 p-1">
      {tabs.map((t) => (
        <Link key={t.href} href={t.href} className="tab" data-active={pathname === t.href}>
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
