"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserCheck, Phone, MapPin, Landmark, Loader2, Edit2, Trash2, ShieldAlert } from "lucide-react";
import { creerClienteAction, supprimerClienteAction } from "@/app/actions/admin";
import { toast } from "sonner";

interface ZoneType {
  id: string;
  nom: string;
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

interface FormClienteProps {
  clientes: ClienteType[];
  zones: ZoneType[];
}

export default function FormCliente({ clientes, zones }: FormClienteProps) {
  const router = useRouter();
  const [estEnCours, setEstEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [idEnCorrection, setIdEnCorrection] = useState<string | null>(null);

  // ÉTATS DES CHAMPS
  const [nomCliente, setNomCliente] = useState("");
  const [prenomCliente, setPrenomCliente] = useState("");
  const [telCliente, setTelCliente] = useState("");
  const [adresseCliente, setAdresseCliente] = useState("");
  const [zoneClienteId, setZoneClienteId] = useState("");
  const [detteInitiale, setDetteInitiale] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomCliente || !zoneClienteId) return;

    setEstEnCours(true);
    setErreur(null);

    const res = await creerClienteAction({
        id: idEnCorrection,
      nom: nomCliente,
      prenom: prenomCliente,
      telephone: telCliente,
      adresse: adresseCliente,
      zoneId: zoneClienteId,
      soldeDette: parseFloat(detteInitiale) || 0,
    });

    if (res.success) {
      setNomCliente("");
      setPrenomCliente("");
      setTelCliente("");
      setAdresseCliente("");
      setZoneClienteId("");
      setDetteInitiale("");
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
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-2xs space-y-3 self-start">
        <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
          <UserCheck size={13} className="text-green-600" />
          {idEnCorrection ? "Modifier la Revendeuse" : "Nouvelle Revendeuse"}
        </h3>

        {erreur && (
          <p className="text-[11px] font-bold text-red-600 bg-red-50 p-2 rounded-lg border border-red-100">
            {erreur}
          </p>
        )}

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="block md:text-base text-[10px] font-bold uppercase tracking-wider text-slate-400">Nom</label>
            <input type="text" required disabled={estEnCours} placeholder="ex: AGBOSSA" value={nomCliente} onChange={(e) => setNomCliente(e.target.value)} className="w-full px-2.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-green-500 focus:bg-white transition" />
          </div>
          <div className="space-y-1">
            <label className="block md:text-base text-[10px] font-bold uppercase tracking-wider text-slate-400">Prénom</label>
            <input type="text" disabled={estEnCours} placeholder="ex: Chantal" value={prenomCliente} onChange={(e) => setPrenomCliente(e.target.value)} className="w-full px-2.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-green-500 focus:bg-white transition" />
          </div>
        </div>

        <div className="space-y-1">
          <label className="block md:text-base text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1"><Phone size={10} /> Téléphone</label>
          <input type="tel" disabled={estEnCours} placeholder="ex: 96000000" value={telCliente} onChange={(e) => setTelCliente(e.target.value)} className="w-full px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-green-500 focus:bg-white transition" />
        </div>

        <div className="space-y-1">
          <label className="block md:text-base text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1"><MapPin size={10} /> {"Marché d'affectation"}</label>
          <select required disabled={estEnCours} value={zoneClienteId} onChange={(e) => setZoneClienteId(e.target.value)} className="w-full px-3 py-1.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-green-500 focus:bg-white transition cursor-pointer">
            <option value="" disabled>--- Choisir le marché ---</option>
            {zones.map((z) => <option key={z.id} value={z.id}>{z.nom}</option>)}
          </select>
        </div>

        <div className="space-y-1">
          <label className="block md:text-base text-[10px] font-bold uppercase tracking-wider text-slate-400">Adresse / Allée (Optionnel)</label>
          <input type="text" disabled={estEnCours} placeholder="ex: Allée B, étal 4" value={adresseCliente} onChange={(e) => setAdresseCliente(e.target.value)} className="w-full px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-green-500 focus:bg-white transition" />
        </div>

        <div className="space-y-1">
          <label className="block md:text-base text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1"><Landmark size={10} /> Dette de départ (FCFA)</label>
          <input type="number" disabled={estEnCours || idEnCorrection !== null} placeholder="0" value={detteInitiale} onChange={(e) => setDetteInitiale(e.target.value)} className="w-full px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-green-500 focus:bg-white transition" />
        </div>

        {detteInitiale && parseFloat(detteInitiale) > 0 && (
          <div className="p-2 bg-amber-50 rounded-xl border border-amber-200/60 text-[10px] font-semibold text-amber-800 flex items-start gap-1.5 animate-in fade-in duration-200">
            <ShieldAlert size={12} className="shrink-0 mt-0.5" />
            <p>Sera injecté comme dette initiale visible sur mobile.</p>
          </div>
        )}

        <button type="submit" disabled={estEnCours} className="w-full cursor-pointer bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition active:scale-95">
          {estEnCours ? <Loader2 className="animate-spin" size={14} /> : idEnCorrection ? "Mettre à jour" : "Enregistrer la Maman"}
        </button>
      </form>

      {/* COLONNE DROITE : TABLEAU */}
      <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[550px]">
          <thead>
            <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <th className="p-2.5 text-[9px] font-bold uppercase tracking-wider">Maman</th>
              <th className="p-2.5 text-[9px] font-bold uppercase tracking-wider">Secteur</th>
              <th className="p-2.5 text-[9px] font-bold uppercase tracking-wider text-right">Solde Actuel</th>
              <th className="p-2.5 text-[9px] font-bold uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {clientes.length > 0 ? (
              clientes.map((c) => {
                const estDette = c.soldeDette > 0;
                const estAvance = c.soldeDette < 0;
                return (
                  <tr key={c.id} className="hover:bg-slate-50/40 bg-white transition font-medium">
                    <td className="p-2.5 text-xs font-bold text-slate-900">
                      {c.prenom} {c.nom} <span className="block text-[9px] text-slate-400 font-medium tracking-tight">{c.telephone}</span>
                    </td>
                    <td className="p-2.5 text-xs font-semibold text-slate-600 uppercase">{c.zoneNom}</td>
                    <td className="p-2.5 text-xs text-right font-black tracking-tight">
                      <span className={estDette ? "text-red-600" : estAvance ? "text-green-600" : "text-slate-500"}>
                        {Math.abs(c.soldeDette).toLocaleString()} F
                      </span>
                    </td>
                    <td className="p-2.5 text-right space-x-1 shrink-0">
                      <button 
                        type="button" 
                        onClick={() => { 
                          setNomCliente(c.nom); setPrenomCliente(c.prenom); setTelCliente(c.telephone !== "Pas de numéro" ? c.telephone : "");
                          setAdresseCliente(c.adresse !== "Pas d'adresse" ? c.adresse : ""); setZoneClienteId(c.zoneId); setDetteInitiale(c.soldeDette.toString());
                          setIdEnCorrection(c.id);
                        }} 
                        className="p-1 text-amber-600 hover:text-amber-600 rounded-md hover:bg-amber-50 transition cursor-pointer inline-flex items-center"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button 
                      type="button" 
                      disabled={estEnCours}
                      onClick={async () => {
                        if (confirm(`Voulez-vous vraiment supprimer la fiche de ${c.prenom} ${c.nom} ?`)) {
                          setEstEnCours(true);
                          setErreur(null);
                          const toastId = toast.loading(`Suppression du secteur "${c.nom}" sur Neon...`);
                          
                          const res = await supprimerClienteAction(c.id);
                          
                      if (res.success) {

                        toast.success(`Le secteur "${c.nom}" a été retiré.`, { id: toastId });
                        setIdEnCorrection(null);
                        setNomCliente("");
                        setPrenomCliente("");
                        setTelCliente("");
                        setAdresseCliente("");
                        setZoneClienteId("");
                        setDetteInitiale("");
                        
                        router.refresh(); // Rafraîchit le tableau instantanément
                      } else {

                        toast.error(res.error || "Action refusée par la base de données.", { 
                                id: toastId,
                                duration: 4000 // Laisse le temps de lire le motif du blocage
                              });
                        setErreur(res.error || "Impossible de supprimer cette revendeuse.");
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
                );
              })
            ) : (
              <tr>
                <td colSpan={4} className="p-6 text-center text-xs font-semibold text-slate-400 bg-slate-50/50">
                  Aucune revendeuse enregistrée.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

