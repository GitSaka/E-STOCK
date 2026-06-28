"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  ShoppingCart, 
  Coins, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  ShieldCheck,
  User,
  MapPin
} from "lucide-react";
import { Toaster } from "sonner";

export default function AdminLayoutPremium({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // État pour le menu burger tactile sur smartphone
  const [menuMobileOuvert, setMenuMobileOuvert] = useState(false);

  // Les 6 modules vitaux configurés proprement
  const menuItems = [
    { name: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
    { name: "Gestion Stocks", href: "/produits", icon: Package },
    { name: "Bonnes Dames", href: "/clientes", icon: Users },
    { name: "Ventes à Crédit", href: "/ventes", icon: ShoppingCart },
    { name: "Clôtures du Soir", href: "/clotures", icon: Coins },
    { name: "Paramètres", href: "/parametres", icon: Settings },
  ];

  const deconnexionSecurisee = () => {
    if (confirm("Confirmez-vous votre déconnexion de l'espace d'administration ?")) {
      window.location.href = "/login";
    }
  };
 return (
    <div className="max-h-screen bg-linear-to-tr from-slate-50 to-slate-200/40 flex flex-col md:flex-row antialiased text-slate-900 w-full min-w-0 overflow-x-hidden relative">
      
      {/* EFFETS DE LUMIÈRE DISCRETE EN ARRIÈRE-PLAN POUR LE LOOK PRESTIGE */}
      <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] bg-green-200/10 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-emerald-200/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* ========================================================================= */}
      {/* 1. NAVBAR SUPÉRIEURE MOBILE HAUT DE GAMME (Visible sur Smartphone/Tablette)*/}
      {/* ========================================================================= */}
      <header className="md:hidden bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-4 py-3 flex items-center justify-between sticky top-0 z-50 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 bg-linear-to-tr from-green-600 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-600/20">
            <ShieldCheck size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold tracking-tight text-slate-900 leading-tight">E-Stock</h1>
            <p className="text-[10px] text-emerald-600 font-bold leading-none tracking-wider uppercase">Direction</p>
          </div>
        </div>

        {/* Bouton Burger Épuré */}
        <button
          onClick={() => setMenuMobileOuvert(!menuMobileOuvert)}
          className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition cursor-pointer"
        >
          {menuMobileOuvert ? <X size={18} /> : <Menu size={18} />}
        </button>
      </header>

      {/* MENU MOBILE DÉROULANT STYLE GLASSMORPHISM */}
      {menuMobileOuvert && (
        <div className="md:hidden fixed inset-x-0 top-[53px] bottom-0 bg-white/95 backdrop-blur-xl z-40 p-4 space-y-4 animate-in fade-in slide-in-from-top-3 duration-200">
          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const Icone = item.icon;
              const estActif = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuMobileOuvert(false)}
                  className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl text-base font-bold transition-all ${
                    estActif 
                      ? "bg-linear-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-600/20" 
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Icone size={20} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <button
            onClick={() => {
              setMenuMobileOuvert(false);
              deconnexionSecurisee();
            }}
            className="flex items-center gap-4 px-4 py-3.5 rounded-2xl text-base font-bold text-red-600 hover:bg-red-50/60 transition w-full text-left cursor-pointer border-t border-slate-100 pt-4"
          >
            <LogOut size={20} />
            {"Fermer l'espace"}
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SIDEBAR BLANCHE PREMIUM SUR GRAND ÉCRAN (Visible sur PC / Laptop)       */}
      {/* ========================================================================= */}
      <aside className="hidden md:flex flex-col w-64 bg-white/80 backdrop-blur-xl border-r border-slate-200/60 shrink-0 sticky top-0 h-screen p-5 shadow-xl shadow-slate-200/40">
        
        {/* Identité Visuelle Lumineuse */}
        <div className="flex items-center gap-3 pb-6 border-b border-slate-150">
          <div className="h-10 w-10 bg-linear-to-tr from-green-600 to-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-green-600/25 ring-4 ring-green-50">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900 tracking-tight leading-none">E-Stock Bureau</h2>
            <span className="text-[10px] text-emerald-600 font-bold tracking-wider uppercase mt-1 block">Espace Admin</span>
          </div>
        </div>

        {/* Liens de Navigation PC Épurés */}
        <nav className="flex-1 space-y-1 mt-6">
          {menuItems.map((item) => {
            const Icone = item.icon;
            const estActif = pathname === item.href;
            return (
              <Link
                key={item.href}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-bold tracking-tight transition-all duration-200 group ${
                  estActif
                    ? "bg-linear-to-r from-green-600 to-emerald-600 text-white font-extrabold shadow-xl shadow-green-600/20"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
                href={item.href}
              >
                <Icone size={18} className={`transition-transform duration-200 group-hover:scale-105 ${estActif ? "text-white" : "text-slate-400 group-hover:text-slate-600"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Pied de la Sidebar (Session & Profil Actif) */}
        <div className="border-t border-slate-150 pt-4 space-y-2">
          <div className="flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200/50">
            <div className="h-8 w-8 bg-white border border-slate-200 shadow-2xs rounded-lg flex items-center justify-center text-slate-600 shrink-0">
              <User size={14} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black text-slate-800 truncate leading-none">Chef Direction</p>
              <span className="text-[9px] text-slate-400 font-medium flex items-center gap-0.5 mt-1 leading-none">
                <MapPin size={9} /> Porto-Novo
              </span>
            </div>
          </div>
          <button
            onClick={deconnexionSecurisee}
            className="flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-red-50 hover:text-red-600 transition w-full text-left cursor-pointer"
          >
            <LogOut size={16} className="text-slate-400" />
            Déconnecter la session
          </button>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 3. ZONE CENTRALE DE TRAVAIL PREMIUM                                       */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* En-tête Supérieur PC Lumineux */}
        <header className="hidden md:flex items-center justify-between h-14 bg-white/60 backdrop-blur-md border-b border-slate-200/60 px-6 shrink-0">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Surveillance en temps réel</p>
          <div className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200/40">
            Porto-Novo • Bénin
          </div>
        </header>

        {/* CONTENU RESPONSIVE : p-2 sur smartphone pour coller, p-6 sur grand PC */}
        <main className="flex-1 w-full max-w-7xl mx-auto p-2 sm:p-4 md:p-6 overflow-y-auto">
          {children}
        </main>
      </div>

       <Toaster position="top-right" richColors />

    </div>
  );
}