"use client";

import { useState } from "react";
import { Sparkles, Globe, UserPlus, UserCheck } from "lucide-react";
import FormZone from "./FormZone";
import FormAgent from "./FormAgent";
import FormCliente from "./FormCliente";

interface ZoneType {
  id: string;
  nom: string;
  adresse: string | null;
}

interface ClienteType {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  adresse: string;
  zoneNom: string;
  zoneId: string;
  soldeDette: number;
}

interface AgentType {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  zones: string[];
}

interface ParametresClientProps {
  initialZones: ZoneType[];
  initialClientes: ClienteType[];
  initialAgents: AgentType[];
}

export default function ParametresClient({
  initialZones,
  initialClientes,
  initialAgents
}: ParametresClientProps) {
  const [ongletActif, setOngletActif] = useState<"ZONES" | "AGENTS" | "CLIENTES">("ZONES");

  return (
    <div className="w-full space-y-3 px-1">
      
      {/* EN-TÊTE LUMINEUX COMPACT */}
      <div className="bg-white/80 backdrop-blur-md border border-slate-200/60 p-4 rounded-xl shadow-md flex items-start gap-3">
        <div className="h-9 w-9 bg-gradient-to-tr from-green-600 to-emerald-500 rounded-lg flex items-center justify-center text-white shadow-lg shrink-0">
          <Sparkles size={16} />
        </div>
        <div className="space-y-0.5">
          <h1 className="text-base font-black tracking-tight text-slate-900">Paramétrage Configuration Centrale</h1>
          <p className="text-[10px] font-semibold text-slate-400">{"Gérez l'organisation humaine et les secteurs de Porto-Novo."}</p>
        </div>
      </div>

      {/* LES 3 ONGLETS ALIGNÉS EN TAILWIND V3 */}
      <div className="grid grid-cols-3 gap-1 bg-slate-200/40 p-1 rounded-xl border border-slate-200/50">
        <button type="button" onClick={() => setOngletActif("ZONES")} className={`py-2 text-[10px] md:text-base font-black uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${ongletActif === "ZONES" ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-xs" : "text-slate-600 hover:bg-white/40"}`}>
          <Globe size={12} /> ZONES
        </button>
        <button type="button" onClick={() => setOngletActif("AGENTS")} className={`py-2 text-[10px] md:text-base font-black uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${ongletActif === "AGENTS" ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-xs" : "text-slate-600 hover:bg-white/40"}`}>
          <UserPlus size={12} /> AGENTS
        </button>
        <button type="button" onClick={() => setOngletActif("CLIENTES")} className={`py-2 text-[10px] md:text-base font-black uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${ongletActif === "CLIENTES" ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-xs" : "text-slate-600 hover:bg-white/40"}`}>
          <UserCheck size={12} /> Revendeuses
        </button>
      </div>

      {/* AFFICHAGE EN FONCTION DE L'ONGLET SANS CHEVAUCHEMENT */}
      <div className="mt-3">
        {ongletActif === "ZONES" && <FormZone zones={initialZones} />}
        {ongletActif === "AGENTS" && <FormAgent agents={initialAgents} zones={initialZones} />}
        {ongletActif === "CLIENTES" && <FormCliente clientes={initialClientes} zones={initialZones} />}
      </div>

    </div>
  );
}
