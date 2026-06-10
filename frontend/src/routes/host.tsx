import { Outlet, createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import { Brand } from "@/components/Brand";
import { UserPlus, Search } from "lucide-react";

export const Route = createFileRoute("/host")({
  component: HostLayout,
});

function HostLayout() {
  const pathname = useRouterState({ select: s => s.location.pathname });
  const tabs = [
    { to: "/host/register", label: "Enregistrement", icon: UserPlus },
    { to: "/host/search", label: "Rechercher / Régénérer", icon: Search },
  ];
  return (
    <div className="min-h-screen">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="mx-auto max-w-5xl px-6 h-16 flex items-center justify-between">
          <Brand subtitle="Espace accueil — tablette" />
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Menu</Link>
        </div>
        <nav className="mx-auto max-w-5xl px-4 flex gap-1">
          {tabs.map(t => {
            const active = pathname === t.to;
            return (
              <Link key={t.to} to={t.to}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition ${active ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                <t.icon className="h-4 w-4" /> {t.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8"><Outlet /></main>
    </div>
  );
}
