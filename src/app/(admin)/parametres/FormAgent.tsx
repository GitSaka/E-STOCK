"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Phone, Lock, MapPin, Loader2, Edit2, Trash2 } from "lucide-react";
import { creerAgentAction,supprimerAgentAction} from "@/app/actions/admin";
import { toast } from "sonner";

interface ZoneType {
  id: string;
  nom: string;
}

interface AgentType {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  zones: string[];
}

interface FormAgentProps {
  agents: AgentType[];
  zones: ZoneType[];
}

export default function FormAgent({ agents, zones }: FormAgentProps) {
  const router = useRouter();
  const [estEnCours, setEstEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [idEnCorrection, setIdEnCorrection] = useState<string | null>(null);

  // ÉTATS DES CHAMPS
  const [nomAgent, setNomAgent] = useState("");
  const [prenomAgent, setPrenomAgent] = useState("");
  const [telAgent, setTelAgent] = useState("");
  const [passAgent, setPassAgent] = useState("");
  const [zonesAgentChoisies, setZonesAgentChoisies] = useState<string[]>([]);

  // Basculer l'état d'une case à cocher (Multi-zones)
  const handleToggleZone = (id: string) => {
    setZonesAgentChoisies((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomAgent || !prenomAgent || !telAgent || (!idEnCorrection && !passAgent)) return;

    setEstEnCours(true);
    setErreur(null);

    const res = await creerAgentAction({
     id: idEnCorrection,
      nom: nomAgent,
      prenom: prenomAgent,
      telephone: telAgent,
      motDePasse: passAgent,
      zoneIds: zonesAgentChoisies,
    });

    if (res.success) {
      setNomAgent("");
      setPrenomAgent("");
      setTelAgent("");
      setPassAgent("");
      setZonesAgentChoisies([]);
      setIdEnCorrection(null);
      router.refresh();
    } else {
      setErreur(res.error || "Une erreur est survenue.");
    }
    setEstEnCours(false);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {/* COLONNE GAUCHE : FORMULAIRE */}
            {/* COLONNE GAUCHE (1/3) : FORMULAIRE CHIRURGICAL AGENT PREMIUM */}
      <form 
        onSubmit={handleSubmit} 
        className="bg-white border border-slate-200 p-3 rounded-2xl shadow-sm space-y-4 self-start"
      >
        <h3 className="text-sm md:text-base font-black text-slate-800 uppercase tracking-wider border-b border-slate-150 pb-1 flex items-center gap-2">
          <UserPlus size={16} className="text-green-600" />
          {idEnCorrection ? "Modifier le Collecteur" : "Nouveau Collecteur"}
        </h3>

        {erreur && (
          <p className="text-xs md:text-sm font-bold text-red-600 bg-red-50 p-1.5 rounded-xl border border-red-100">
            {erreur}
          </p>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-[11px] md:text-xs font-bold uppercase tracking-wider text-slate-400">Nom</label>
            <input 
              type="text" 
              required 
              disabled={estEnCours} 
              placeholder="ex: KOFFI" 
              value={nomAgent} 
              onChange={(e) => setNomAgent(e.target.value)} 
              className="w-full px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm md:text-base font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-green-500 focus:bg-white transition" 
            />
          </div>
          <div className="space-y-1">
            <label className="block text-[11px] md:text-xs font-bold uppercase tracking-wider text-slate-400">Prénom</label>
            <input 
              type="text" 
              required 
              disabled={estEnCours} 
              placeholder="ex: Marc" 
              value={prenomAgent} 
              onChange={(e) => setPrenomAgent(e.target.value)} 
              className="w-full px-2.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm md:text-base font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-green-500 focus:bg-white transition" 
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-[11px] md:text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Phone size={12} className="text-slate-400" /> Téléphone (Identifiant)
          </label>
          <input 
            type="tel" 
            required 
            disabled={estEnCours} 
            placeholder="ex: 97000000" 
            value={telAgent} 
            onChange={(e) => setTelAgent(e.target.value)} 
            className="w-full px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm md:text-base font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-green-500 focus:bg-white transition" 
          />
        </div>

        <div className="space-y-1">
          <label className="block text-[11px] md:text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Lock size={12} className="text-slate-400" /> {"Mot de passe d'accès"}
          </label>
          <input 
            type="password" 
            required={!idEnCorrection} 
            disabled={estEnCours} 
            placeholder={idEnCorrection ? "•••••••• (Inchangé si vide)" : "••••••••"} 
            value={passAgent} 
            onChange={(e) => setPassAgent(e.target.value)} 
            className="w-full px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm md:text-base font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-green-500 focus:bg-white transition" 
            />
        </div>

        {/* SÉLECTEUR DE ZONES SANS CHECKBOX CLASSIQUE : LOOK BADGES PREMIUM */}
        <div className="space-y-2">
          <label className="block text-[11px] md:text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <MapPin size={12} className="text-slate-400" /> {"Affectation des marchés de l'agent"}
          </label>
          
          {/* Grille de badges cliquables, hauteur contrôlée avec défilement fluide */}
          <div className="grid grid-cols-1 gap-1.5 max-h-36 overflow-y-auto p-1 bg-slate-50/30 border border-slate-200 rounded-xl">
            {zones.map((z) => {
              const estCoche = zonesAgentChoisies.includes(z.id);
              return (
                <button
                  key={z.id}
                  type="button"
                  disabled={estEnCours}
                  onClick={() => handleToggleZone(z.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs md:text-sm font-bold border transition-all text-left cursor-pointer active:scale-[0.99] select-none ${
                    estCoche
                      ? "bg-emerald-50 border-emerald-300 text-emerald-800 shadow-2xs font-extrabold"
                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <span className="truncate">{z.nom}</span>
                  {/* Petit indicateur de sélection haut de gamme */}
                  <div className={`h-4 w-4 rounded-full border flex items-center justify-center transition-colors ${
                    estCoche ? "bg-emerald-600 border-emerald-600 text-white" : "border-slate-300 bg-white"
                  }`}>
                    {estCoche && (
                      <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <button 
          type="submit" 
          disabled={estEnCours} 
          className="w-full cursor-pointer bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 rounded-xl text-xs md:text-sm flex items-center justify-center gap-2 shadow-xs transition active:scale-[0.98]"
        >
          {estEnCours ? <Loader2 className="animate-spin" size={16} /> : idEnCorrection ? "Enregistrer les modifications" : "Créer le Compte Collecteur"}
        </button>
      </form>


      {/* COLONNE DROITE : TABLEAU */}
      <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[500px]">
          <thead>
            <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <th className="p-2.5 text-[9px] font-bold uppercase tracking-wider">Collecteur</th>
              <th className="p-2.5 text-[9px] font-bold uppercase tracking-wider">Téléphone</th>
              <th className="p-2.5 text-[9px] font-bold uppercase tracking-wider">Secteurs</th>
              <th className="p-2.5 text-[9px] font-bold uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {agents.length > 0 ? (
              agents.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/40 bg-white transition font-medium">
                  <td className="p-2.5 text-xs font-bold text-slate-900">{a.prenom} {a.nom}</td>
                  <td className="p-2.5 text-xs text-slate-500 tracking-tight">{a.telephone}</td>
                  <td className="p-2.5 text-xs">
                    <div className="flex flex-wrap gap-1">
                      {a.zones.length > 0 ? (
                        a.zones.map((zNom) => (
                          <span key={zNom} className="bg-slate-100 text-slate-700 border border-slate-200 text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase">
                            {zNom}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-amber-600 font-semibold italic">Aucun secteur</span>
                      )}
                    </div>
                  </td>
                  <td className="p-2.5 text-right space-x-1 shrink-0">
                    <button type="button" onClick={() => { setNomAgent(a.nom); setPrenomAgent(a.prenom); setTelAgent(a.telephone); setPassAgent(""); setIdEnCorrection(a.id); }} className="p-1 text-amber-600 hover:text-amber-600 rounded-md hover:bg-amber-50 transition cursor-pointer inline-flex items-center"><Edit2 size={13} /></button>
                    <button 
                      type="button" 
                      disabled={estEnCours}
                      onClick={async () => {
                        if (confirm(`Voulez-vous vraiment supprimer le compte de ${a.prenom} ${a.nom} ?`)) {
                          setEstEnCours(true);
                          setErreur(null);

                          const toastId = toast.loading(`Suppression du secteur "${a.nom}" sur Neon...`);
                          
                          const res = await supprimerAgentAction(a.id);
                          
                          if (res.success) {
                            setNomAgent("");
                            setPrenomAgent("");
                            setTelAgent("");
                            setPassAgent("");
                            setZonesAgentChoisies([]);
                            setIdEnCorrection(null);
                            toast.success(`Le secteur "${a.nom}" a été retiré.`, { id: toastId });
                            router.refresh(); // Actualise le tableau à chaud
                          } else {
                             toast.error(res.error || "Action refusée par la base de données.", { 
                                id: toastId,
                                duration: 4000 // Laisse le temps de lire le motif du blocage
                              });
                            setErreur(res.error || "Impossible de supprimer ce collecteur.");
                          }
                          setEstEnCours(false);
                        }
                      }} 
                      className="p-1 text-red-600 hover:text-red-600 rounded-md hover:bg-red-50 transition cursor-pointer inline-flex items-center disabled:opacity-40"
                    >
                      <Trash2 size={13} />
                    </button>

                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={4} className="p-6 text-center text-xs font-semibold text-slate-400 bg-slate-50/50">Aucun collecteur de terrain enregistré.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
