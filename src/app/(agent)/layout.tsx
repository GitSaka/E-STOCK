"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Landmark, History, LogOut, ShieldAlert } from "lucide-react";

export default function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const onglets = [
    { name: "Accueil", href: "/mobile-dashboard", icon: Home },
    { name: "Collectes", href: "/collectes", icon: Landmark },
    { name: "Historique", href: "/historique", icon: History },
  ];

  const deconnexionRapide = () => {
    if (confirm("Voulez-vous vous déconnecter de votre espace de terrain ?")) {
      window.location.href = "/login";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row antialiased">
      
      {/* ========================================================================= */}
      {/* 1. BARRE LATÉRALE (SIDEBAR) : Visible UNIQUEMENT sur Grand Écran (PC/Tablette) */}
      {/* ========================================================================= */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-slate-300 border-r border-slate-800 shrink-0 sticky top-0 h-screen p-4">
        <div className="flex items-center gap-2 px-2 pb-6 border-b border-slate-800">
          <div className="h-8 w-8 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold">
            E
          </div>
          <div>
            <h2 className="text-sm font-bold text-white leading-none">E-Stock Agent</h2>
            <span className="text-[10px] text-slate-500 font-medium">Session de Terrain</span>
          </div>
        </div>

        {/* Liens PC */}
        <nav className="flex-1 space-y-1 mt-6">
          {onglets.map((onglet) => {
            const Icone = onglet.icon;
            const estActif = pathname === onglet.href;
            return (
              <Link
                key={onglet.href}
                href={onglet.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                  estActif
                    ? "bg-green-600 text-white font-semibold shadow-md shadow-green-600/10"
                    : "hover:bg-slate-800 hover:text-slate-100"
                }`}
              >
                <Icone size={18} />
                {onglet.name}
              </Link>
            );
          })}
        </nav>

        {/* Déconnexion PC */}
        <button
          onClick={deconnexionRapide}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition w-full text-left cursor-pointer"
        >
          <LogOut size={18} />
          Quitter l'espace
        </button>
      </aside>

      {/* ========================================================================= */}
      {/* 2. ZONE DE CONTENU PRINCIPALE : S'élargit magnifiquement sur PC */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 w-full max-w-7xl mx-auto px-2 sm:px-4 py-3 md:py-6 pb-20 md:pb-6">
          {children}
        </main>
      </div>

      {/* ========================================================================= */}
      {/* 3. BARRE DE NAVIGATION BASSE (BOTTOM BAR) : Visible UNIQUEMENT sur Mobile */}
      {/* ========================================================================= */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200/80 shadow-lg z-50">
        <div className="flex items-center justify-around h-14 px-1">
          {onglets.map((onglet) => {
            const Icone = onglet.icon;
            const estActif = pathname === onglet.href;

            return (
              <Link
                key={onglet.href}
                href={onglet.href}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                  estActif ? "text-green-600 font-bold" : "text-slate-400"
                }`}
              >
                <Icone size={18} className={estActif ? "scale-105" : ""} />
                <span className="text-[10px] mt-0.5 tracking-tight">{onglet.name}</span>
              </Link>
            );
          })}

          <button
            onClick={deconnexionRapide}
            className="flex flex-col items-center justify-center flex-1 h-full text-red-400 transition-colors cursor-pointer"
          >
            <LogOut size={18} />
            <span className="text-[10px] mt-0.5 tracking-tight">Quitter</span>
          </button>
        </div>
      </nav>

    </div>
  );
}