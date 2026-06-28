"use client";

import { useState } from "react";
import { Search, Wallet, ArrowRight, MapPin, User, LogOut, LayoutDashboard } from "lucide-react";
import Link from "next/link";

interface ClienteType {
  id: string;
  nom: string;
  telephone: string | null;
  soldeDette: number;
}

interface DashboardClientProps {
  agentName: string;
  zoneName: string;
  caisseEnAttente: number;
  initialClientes: ClienteType[];
}

export default function DashboardClient({
  agentName,
  zoneName,
  caisseEnAttente,
  initialClientes
}: DashboardClientProps) {
  const [recherche, setRecherche] = useState("");

  const clientesFiltrees = initialClientes.filter((c) =>
    c.nom.toLowerCase().includes(recherche.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50/50 pb-8">
      
      {/* 1. NAVBAR PREMIUM HAUTE */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-4 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 bg-green-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-green-600/20">
              <LayoutDashboard size={18} />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 leading-tight">E-Stock Terrain</h1>
              <p className="text-[10px] text-slate-400 font-medium leading-none">Porto-Novo</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-slate-800">{agentName}</span>
              <span className="text-[10px] text-green-600 font-semibold flex items-center gap-0.5 justify-end">
                <MapPin size={10} /> Marché {zoneName}
              </span>
            </div>
            <div className="sm:hidden h-8 w-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 border border-slate-200">
              <User size={16} />
            </div>
            <button 
              onClick={() => {
                if(confirm("Voulez-vous quitter votre espace de terrain ?")) {
                  window.location.href = "/login";
                }
              }}
              className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-slate-50 transition cursor-pointer"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* CONTENU PRINCIPAL */}
      <main className="max-w-7xl mx-auto px-4 pt-4 space-y-4">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Badge de Zone (Visible uniquement sur Mobile) */}
          {/* Correction syntaxe Tailwind v3 : bg-gradient-to-r */}
          <div className="sm:hidden bg-gradient-to-r from-slate-900 to-slate-800 text-white p-3 rounded-2xl flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <User size={14} className="text-slate-400" />
              <span className="text-xs font-semibold truncate max-w-[150px]">{agentName}</span>
            </div>
            <span className="bg-green-600 px-2 py-1 rounded-lg font-bold text-[10px] tracking-wide flex items-center gap-1 uppercase">
              <MapPin size={10} /> MARCHÉ {zoneName}
            </span>
          </div>

          {/* Carte Poche du Jour (Donnée réelle de la caisse en attente) */}
          <div className="bg-white border border-slate-200/80 p-3 rounded-2xl flex items-center justify-between shadow-xs transition hover:shadow-md">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 border border-emerald-100/60">
                <Wallet size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Collecte en poche</p>
                <p className="text-base font-black text-slate-900 mt-0.5">{caisseEnAttente.toLocaleString()} FCFA</p>
              </div>
            </div>
            <span className="text-[9px] font-bold bg-amber-50 text-amber-700 px-2 py-1 rounded-md uppercase border border-amber-100/60">
              En attente
            </span>
          </div>
        </div>

        {/* 2. BARRE DE RECHERCHE DESIGN */}
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
            <Search size={16} />
          </div>
          <input
            type="text"
            placeholder="Rechercher une cliente par son nom..."
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            className="block w-full pl-10 pr-4 py-2.5 text-sm text-slate-900 border border-slate-200 rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition shadow-xs placeholder-slate-400 hover:border-slate-300"
          />
        </div>

        {/* 3. GRILLE DES CLIENTES DE LA ZONE */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {clientesFiltrees.length > 0 ? (
            clientesFiltrees.map((cliente) => {
              const aUneDette = cliente.soldeDette > 0;
              const aUneAvance = cliente.soldeDette < 0;

              return (
                <Link
                  key={cliente.id}
                  // Redirige vers l'écran d'encaissement avec l'ID réel en paramètre
                  href={`/collectes?id=${cliente.id}`}
                  className="group flex items-center justify-between bg-white border border-slate-200/80 p-3 rounded-2xl active:bg-slate-50 transition shadow-2xs hover:border-green-500 hover:shadow-md cursor-pointer"
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <p className="text-sm font-bold text-slate-800 group-hover:text-green-700 transition truncate">
                      {cliente.nom}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5 font-medium">
                      {cliente.telephone || "Pas de numéro"}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p
                        className={`text-sm font-black tracking-tight ${
                          aUneDette
                            ? "text-red-600"
                            : aUneAvance
                            ? "text-green-600"
                            : "text-slate-500"
                        }`}
                      >
                        {aUneAvance
                          ? `${Math.abs(cliente.soldeDette).toLocaleString()} FCFA`
                          : `${cliente.soldeDette.toLocaleString()} FCFA`}
                      </p>
                      <p className="text-[9px] font-bold uppercase tracking-wider leading-none mt-1 text-slate-400">
                        {aUneDette ? "À Payer" : aUneAvance ? "Avance" : "À Jour"}
                      </p>
                    </div>
                    <div className="h-6 w-6 bg-slate-50 group-hover:bg-green-50 rounded-lg flex items-center justify-center text-slate-300 group-hover:text-green-600 transition">
                      <ArrowRight size={14} />
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="col-span-full bg-white border border-slate-200 p-8 rounded-2xl text-center text-sm text-slate-400 shadow-2xs">
              Aucune maman enregistrée dans la zone {zoneName}.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
