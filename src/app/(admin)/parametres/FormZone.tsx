"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Globe, Loader2, Edit2, Trash2 } from "lucide-react";
import { creerZoneAction } from "@/app/actions/admin";
import { supprimerZoneAction } from "@/app/actions/admin";
import { toast } from "sonner";


interface ZoneType {
  id: string;
  nom: string;
  adresse: string | null;
}

interface FormZoneProps {
  zones: ZoneType[];
}

export default function FormZone({ zones }: FormZoneProps) {
  const router = useRouter();
  const [estEnCours, setEstEnCours] = useState(false);
  const [nomZone, setNomZone] = useState("");
  const [adresseZone, setAdresseZone] = useState("");
  const [idEnCorrection, setIdEnCorrection] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomZone.trim()) return;

    setEstEnCours(true);
    setErreur(null);

    const res = await creerZoneAction(nomZone, adresseZone,idEnCorrection);

    if (res.success) {
      setNomZone("");
      setAdresseZone("");
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
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200/80 p-3 rounded-2xl shadow-2xs space-y-3 self-start">
        <h3 className="text-base font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
          <Globe size={13} className="text-green-600" />
          {idEnCorrection ? "Corriger le Secteur" : "Nouveau Secteur"}
        </h3>

        {erreur && (
          <p className="text-[11px] font-bold text-red-600 bg-red-50 p-2 rounded-lg border border-red-100">
            {erreur}
          </p>
        )}

        <div className="space-y-1">
          <label className="block text-[11px] md:text-base font-bold uppercase tracking-wider text-slate-400">Nom du Marché</label>
          <input type="text" required disabled={estEnCours} placeholder="ex: Marché Ouando" value={nomZone} onChange={(e) => setNomZone(e.target.value)} className="w-full px-3 py-4 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-green-500 focus:bg-white transition" />
        </div>

        <div className="space-y-1">
          <label className="block text-[11px] md:text-base  font-bold uppercase tracking-wider text-slate-400">Description / Adresse</label>
          <input type="text" disabled={estEnCours} placeholder="ex: Face à la pharmacie" value={adresseZone} onChange={(e) => setAdresseZone(e.target.value)} className="w-full px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-green-500 focus:bg-white transition" />
        </div>

        <button type="submit" disabled={estEnCours} className="w-full cursor-pointer bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-2.5 rounded-xl text-[11px] md:text-base  flex items-center justify-center gap-1.5 shadow-xs transition active:scale-95">
          {estEnCours ? <Loader2 className="animate-spin" size={14} /> : idEnCorrection ? "Mettre à jour" : "Créer le Secteur"}
        </button>
      </form>

      {/* COLONNE DROITE : TABLEAU */}
      <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[450px]">
          <thead>
            <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <th className="p-2.5 text-base text-[11px] font-bold uppercase tracking-wider">Nom du Secteur</th>
              <th className="p-2.5 text-base text-[11px] font-bold uppercase tracking-wider">Description</th>
              <th className="p-2.5 text-base text-[11px] font-bold uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {zones.length > 0 ? (
              zones.map((z) => (
                <tr key={z.id} className="hover:bg-slate-50/40 bg-white transition font-medium">
                  <td className="p-2.5 text-xs font-bold text-slate-900">{z.nom}</td>
                  <td className="p-2.5 text-xs text-slate-500">{z.adresse || "---"}</td>
                  <td className="p-2.5 text-right space-x-1 shrink-0">
                    <button type="button" onClick={() => { setNomZone(z.nom); setAdresseZone(z.adresse || ""); setIdEnCorrection(z.id); }} className="p-1 text-amber-600 hover:text-amber-600 rounded-md hover:bg-amber-50 transition cursor-pointer inline-flex items-center"><Edit2 size={13} /></button>
                    <button 
                  type="button" 
                  disabled={estEnCours}
                  onClick={async () => {
                    if (confirm(`Voulez-vous vraiment supprimer la zone "${z.nom}" ?`)) {
                      setEstEnCours(true);
                      setErreur(null);

                       const toastId = toast.loading(`Suppression du secteur "${z.nom}" sur Neon...`);
                      
                      const res = await supprimerZoneAction(z.id);
                      
                      if (res.success) {
                        setIdEnCorrection(null);
                        setNomZone("");
                        setAdresseZone("");
                        toast.success(`Le secteur "${z.nom}" a été retiré.`, { id: toastId });
                        router.refresh(); // Rafraîchit la liste instantanément
                      } else {
                         toast.error(res.error || "Action refusée par la base de données.", { 
                          id: toastId,
                          duration: 4000 // Laisse le temps de lire le motif du blocage
                        });
                        setErreur(res.error || "Impossible de supprimer ce secteur.");
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
              <tr><td colSpan={3} className="p-6 text-center text-xs font-semibold text-slate-400 bg-slate-50/50">Aucun marché configuré pour le moment.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
