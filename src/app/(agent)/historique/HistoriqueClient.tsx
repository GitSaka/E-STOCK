"use client";

import { useState } from "react";
import { History, Calendar, Wallet, ArrowLeft, Search, FileSpreadsheet } from "lucide-react";
import Link from "next/link";

interface HistoriqueLigneType {
  id: string;
  mamanNom: string;
  zone: string;
  montant: number;
  resteAPayer: number;
  statut: "EN_ATTENTE" | "VALIDE";
  heure: string;
}

interface HistoriqueClientProps {
  listeHistorique: HistoriqueLigneType[];
}

export default function HistoriqueClient({ listeHistorique }: HistoriqueClientProps) {
  const [recherche, setRecherche] = useState("");
  const [filtre, setFiltre] = useState<"TOUT" | "EN_ATTENTE" | "VALIDE">("TOUT");

  // Calcul financier de la caisse réelle en poche
  const totalPocheDuJour = listeHistorique.reduce((sum, item) => sum + item.montant, 0);

  // Filtrage en direct sur le smartphone de l'agent
  const donneesFiltrees = listeHistorique.filter((item) => {
    const correspondRecherche = item.mamanNom.toLowerCase().includes(recherche.toLowerCase());
    const correspondStatut = filtre === "TOUT" || item.statut === filtre;
    return correspondRecherche && correspondStatut;
  });

  return (
    <div className="w-full space-y-4 pb-6 px-2">
      
      {/* RETOUR & BARRE D'OUTILS HAUTE ADOUCIE */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link 
          href="/mobile-dashboard" 
          className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3 py-2 rounded-xl shadow-2xs active:bg-slate-100 transition cursor-pointer"
        >
          <ArrowLeft size={14} /> Retour à l'accueil
        </Link>
        <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2.5 py-1.5 rounded-xl text-[10px] font-bold border border-green-200">
          <FileSpreadsheet size={12} /> RAPPORT DE COLLECTE
        </div>
      </div>

      {/* COMPTEUR DE CAISSE DESIGN : Fin du gros bloc noir agressif */}
      <div className="bg-gradient-to-br from-green-700 to-emerald-600 text-white p-4 rounded-2xl shadow-md border-b-4 border-emerald-500/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-in fade-in duration-300">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-emerald-100 text-[10px] font-bold uppercase tracking-wider">
            <Wallet size={12} /> Argent total perçu aujourd'hui
          </div>
          <p className="text-2xl font-black text-white tracking-tight leading-none">
            {totalPocheDuJour.toLocaleString()} FCFA
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-xs px-2.5 py-1.5 rounded-xl border border-white/10 text-[10px] font-bold self-start sm:self-center flex items-center gap-1">
          <Calendar size={11} /> Suivi Terrain • Porto-Novo
        </div>
      </div>

      {/* FILTRES INTERACTIFS COMPACTS */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Filtrer par nom de maman..."
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition shadow-2xs hover:border-slate-300"
          />
        </div>

        {/* Onglets doux (Style gris et blanc apaisant) */}
        <div className="flex bg-slate-200/60 p-1 rounded-xl border border-slate-200/40 shrink-0 gap-0.5">
          {["TOUT", "EN_ATTENTE", "VALIDE"].map((type) => (
            <button
              key={type}
              onClick={() => setFiltre(type as any)}
              className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                filtre === type
                  ? "bg-white text-slate-900 shadow-2xs border border-slate-200"
                  : "text-slate-600 hover:bg-white/40"
              }`}
            >
              {type === "TOUT" ? "Tout" : type === "EN_ATTENTE" ? "En attente" : "Validés"}
            </button>
          ))}
        </div>
      </div>

      {/* RE-CONCEPTION DU TABLEAU : Rendu doux à l'œil (En-tête gris clair) */}
      <div className="w-full overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-2xs">
        <table className="w-full text-left border-collapse min-w-[650px]">
          <thead>
            {/* Remplacement du noir par un gris-bleu très classe et reposant pour les yeux */}
            <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
              <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Heure</th>
              <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Ref</th>
              <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Bonne Dame (Cliente)</th>
              <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Marché / Zone</th>
              <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 text-right">Montant Encaissé</th>
              <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 text-right">Solde Continu (Actuel)</th>
              <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 text-center">Statut du soir</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {donneesFiltrees.length > 0 ? (
              donneesFiltrees.map((row) => {
                const estValide = row.statut === "VALIDE";
                const estUnSurplus = row.resteAPayer < 0;
                const estAjour = row.resteAPayer === 0;

                return (
                  <tr key={row.id} className="hover:bg-slate-50/50 transition-colors bg-white font-medium">
                    
                    {/* 1. HEURE DE COLLECTE */}
                    <td className="p-3 text-xs font-bold text-slate-500">
                      {row.heure}
                    </td>

                    {/* 2. REFF ID */}
                    <td className="p-3 text-xs font-semibold text-slate-400 tracking-tight">
                      #{row.id}
                    </td>

                    {/* 3. NOM CLIENTE */}
                    <td className="p-3 text-sm font-bold text-slate-900">
                      {row.mamanNom}
                    </td>

                    {/* 4. ZONE / MARCHÉ */}
                    <td className="p-3 text-xs font-semibold text-slate-500">
                      {row.zone}
                    </td>

                    {/* 5. MONTANT ENCAISSÉ SUR LE TERRAIN */}
                    <td className="p-3 text-sm font-black text-emerald-600 text-right tracking-tight bg-emerald-50/20">
                      {row.montant.toLocaleString()} F
                    </td>

                    {/* 6. SOLDE CONTINU ACTUEL SUR NEON */}
                    <td className="p-3 text-right tracking-tight">
                      <span className={`text-sm font-bold ${estUnSurplus ? "text-green-600" : estAjour ? "text-slate-500" : "text-red-500"}`}>
                        {Math.abs(row.resteAPayer).toLocaleString()} F
                      </span>
                      <span className={`block text-[8px] font-bold uppercase tracking-wider mt-0.5 ${estUnSurplus ? "text-green-600" : estAjour ? "text-slate-400" : "text-red-400"}`}>
                        {estUnSurplus ? "Avance" : estAjour ? "À jour" : "Dette"}
                      </span>
                    </td>

                    {/* 7. BADGES DE STATUT SÉCURISÉS ET MODERNES */}
                    <td className="p-3 text-center">
                      {estValide ? (
                        <span className="inline-flex items-center justify-center bg-emerald-50 text-emerald-700 font-bold text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-lg border border-emerald-200 shadow-2xs w-24">
                          Validé
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center bg-amber-50 text-amber-700 font-bold text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-lg border border-amber-200 shadow-2xs w-24 animate-pulse">
                          En attente
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="p-8 text-center text-xs font-medium text-slate-400 bg-slate-50/50">
                  Aucun versement enregistré aujourd'hui dans cette catégorie.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
