"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Package, Sparkles, Loader2, Edit2, PlusCircle, 
  AlertTriangle, DollarSign, Layers, X, Trash2, Plus,
  History,
} from "lucide-react";
import { toast } from "sonner";
import { 
  sauvegarderProduitAction, 
  approvisionnerProduitAction,
  supprimerProduitAction
} from "@/app/actions/produits";

interface ArrivageType {
  id: string;
  quantite: number;
  date: string;
}

interface ProduitType {
  id: string;
  nom: string;
  quantiteStock: number;
  prixUnitaire: number;
   arrivages: ArrivageType[];
}

interface ProduitsClientProps {
  initialProduits: ProduitType[];
}

export default function ProduitsClient({ initialProduits }: ProduitsClientProps) {
  const router = useRouter();

  // États généraux de l'interface
  const [estEnCours, setEstEnCours] = useState(false);
  const [erreurFormulaire, setErreurFormulaire] = useState<string | null>(null);

    // Retient l'ID du produit dont on veut voir le tiroir d'historique
  const [produitIdHistoriqueOuvert, setProduitIdHistoriqueOuvert] = useState<string | null>(null);


  // ÉTATS DU FORMULAIRE PRODUIT (OUVERT DANS LA POP-UP CENTRALE)
  const [popProduitOuverte, setPopProduitOuverte] = useState(false);
  const [idEnCorrection, setIdEnCorrection] = useState<string | null>(null);
  const [nomProduit, setNomProduit] = useState("");
  const [prixProduit, setPrixProduit] = useState("");

  // ÉTATS DU FORMULAIRE D'ARRIVAGE (+6 SACS DANS LA POP-UP DE STOCK)
  const [popApprovOuverte, setPopApprovOuverte] = useState(false);
  const [produitCibleApprov, setProduitCibleApprov] = useState<ProduitType | null>(null);
  const [quantiteArrivage, setQuantiteArrivage] = useState("");

  // Calculs financiers instantanés pour les blocs d'indicateurs
  const valeurTotaleStock = initialProduits.reduce((sum, p) => sum + p.quantiteStock * p.prixUnitaire, 0);
  const volumeTotalArticles = initialProduits.reduce((sum, p) => sum + p.quantiteStock, 0);
  const aDesAlertesRupture = initialProduits.some(p => p.quantiteStock < 5);
  // Ouverture de la Pop-up en mode "Création d'un nouvel article"
  const ouvrirPourCreation = () => {
    setIdEnCorrection(null);
    setNomProduit("");
    setPrixProduit("");
    setErreurFormulaire(null);
    setPopProduitOuverte(true);
  };

  // Ouverture de la Pop-up en mode "Modification d'un article existant"
  const ouvrirPourModification = (p: ProduitType) => {
    setIdEnCorrection(p.id);
    setNomProduit(p.nom);
    setPrixProduit(p.prixUnitaire.toString());
    setErreurFormulaire(null);
    setPopProduitOuverte(true);
  };

  // Soumission unifiée du Produit (Création ou Mise à jour)
  const handleSoumissionProduit = async (e: React.FormEvent) => {
    e.preventDefault();
    const prixNum = parseFloat(prixProduit);
    if (!nomProduit.trim() || isNaN(prixNum) || prixNum <= 0) return;

    setEstEnCours(true);
    setErreurFormulaire(null);
    const toastId = toast.loading(idEnCorrection ? "Mise à jour du produit..." : "Ajout au catalogue...");

    const res = await sauvegarderProduitAction({
      id: idEnCorrection,
      nom: nomProduit,
      prixUnitaire: prixNum
    });

    if (res.success) {
      toast.success(res.message || "Opération réussie !", { id: toastId });
      setNomProduit("");
      setPrixProduit("");
      setIdEnCorrection(null);
      setPopProduitOuverte(false); // Ferme la Pop-up automatiquement
      router.refresh();
    } else {
      toast.error(res.error || "Une erreur est survenue.", { id: toastId });
      setErreurFormulaire(res.error || "Échec de l'enregistrement.");
    }
    setEstEnCours(false);
  };

  // Soumission de l'Arrivage de Stock (+X sacs ou bidons)
  const handleSoumissionArrivage = async (e: React.FormEvent) => {
    e.preventDefault();
    const qteNum = parseInt(quantiteArrivage);
    if (!produitCibleApprov || isNaN(qteNum) || qteNum <= 0) return;

    setEstEnCours(true);
    const toastId = toast.loading(`Incrémentation du stock pour ${produitCibleApprov.nom}...`);

    const res = await approvisionnerProduitAction(produitCibleApprov.id, qteNum);

    if (res.success) {
      toast.success(res.message || "Stock augmenté !", { id: toastId });
      setQuantiteArrivage("");
      setPopApprovOuverte(false);
      setProduitCibleApprov(null);
      router.refresh();
    } else {
      toast.error(res.error || "Erreur d'arrivage.", { id: toastId });
    }
    setEstEnCours(false);
  };
  return (
    <div className="w-full space-y-4 px-1">
      
      {/* 1. LES CARTES DE STATISTIQUES ÉPURÉES (LE RÉSUMÉ DU DÉPÔT) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* CARTE A : VALEUR COMPTABLE DU STOCK */}
        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <DollarSign size={11} className="text-green-500" /> Valeur financière en stock
            </p>
            <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              {valeurTotaleStock.toLocaleString()} <span className="text-xs md:text-sm font-bold text-slate-400">FCFA</span>
            </h3>
          </div>
          <div className="h-9 w-9 bg-green-50 rounded-xl flex items-center justify-center text-green-600 border border-green-100">
            <Sparkles size={16} />
          </div>
        </div>

        {/* CARTE B : VOLUME TOTAL EN RÉSERVE */}
        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Layers size={11} className="text-emerald-500" /> {"Volume total d'articles"}
            </p>
            <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              {volumeTotalArticles.toLocaleString()} <span className="text-xs md:text-sm font-bold text-slate-400">Unités</span>
            </h3>
          </div>
          <div className="h-9 w-9 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 border border-emerald-100">
            <Package size={16} />
          </div>
        </div>

        {/* CARTE C : ALERTE DE SÉCURITÉ DISCRÈTE */}
        <div className={`p-4 rounded-2xl border flex items-center justify-between transition-colors hidden lg:flex ${
          aDesAlertesRupture 
            ? "bg-amber-50 border-amber-200 text-amber-900" 
            : "bg-white border-slate-200 text-slate-900"
        }`}>
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Seuil de vigilance</p>
            <h3 className="text-sm font-black tracking-tight flex items-center gap-1.5">
              {aDesAlertesRupture ? (
                <><AlertTriangle size={14} className="text-amber-600 animate-pulse" /> Produits sous les 5 sacs !</>
              ) : (
                "✅ Tous les stocks sont au vert"
              )}
            </h3>
          </div>
        </div>
      </div>

      {/* 2. ZONE COMMERCIALE EN PLEINE LARGEUR (TABLEAU UNIQUE ÉPURÉ) */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-4 space-y-3">
        
        {/* En-tête du tableau avec le bouton d'ouverture du formulaire caché */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <Package size={16} className="text-green-600" />
            <h2 className="text-sm md:text-base font-black text-slate-800 uppercase tracking-wider">Inventaire Général du Dépôt</h2>
          </div>
          <button 
            type="button" 
            onClick={ouvrirPourCreation}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-xs md:text-sm font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition active:scale-95 shadow-xs cursor-pointer select-none"
          >
            <Plus size={14} /> Ajouter un produit
          </button>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[550px]">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <th className="p-2.5 text-xs font-bold uppercase tracking-wider text-slate-400">Marchandise</th>
                <th className="p-2.5 text-xs font-bold uppercase tracking-wider text-slate-400 text-center">Stock Disponible</th>
                <th className="p-2.5 text-xs font-bold uppercase tracking-wider text-slate-400 text-right">Prix Unitaire de Vente</th>
                <th className="p-2.5 text-xs font-bold uppercase tracking-wider text-slate-400 text-right">Actions métiers</th>
              </tr>
            </thead>
                       <tbody className="divide-y divide-slate-100">
              {initialProduits.length > 0 ? (
                initialProduits.map((p) => {
                  const estEnRupture = p.quantiteStock < 5;
                  const estEpuise = p.quantiteStock === 0;
                  const estHistoriqueOuvert = produitIdHistoriqueOuvert === p.id;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/40 bg-white transition font-medium">
                      <td className="p-2.5 text-sm font-black text-slate-950">
                        <div className="flex items-center gap-2">
                          <span className="text-sm md:text-base">{p.nom}</span>
                          
                          {/* 🟢 BOUTON HORLOGE LUCIDE SUBLIMÉ ET PARFAITEMENT VISIBLE */}
                          <button
                            type="button"
                            onClick={() => setProduitIdHistoriqueOuvert(estHistoriqueOuvert ? null : p.id)}
                            className={`p-1.5 rounded-lg border transition cursor-pointer select-none inline-flex items-center justify-center ${
                              estHistoriqueOuvert 
                                ? "bg-slate-900 border-slate-900 text-white shadow-xs" 
                                : "bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                            }`}
                            title="Historique des arrivages"
                          >
                            <History size={13} />
                          </button>
                        </div>

                        {/* LE TIROIR DÉPLIANT (ACCORDION) : Totalement sécurisé */}
                        {estHistoriqueOuvert && (
                          <div className="mt-2 p-2 bg-slate-50 border border-slate-200/60 rounded-xl space-y-1 max-w-md animate-in slide-in-from-top-1 duration-150">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                              Registre des camions de livraison :
                            </p>
                            <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                              {p.arrivages && p.arrivages.length > 0 ? (
                                p.arrivages.map((a) => (
                                  <div key={a.id} className="flex items-center justify-between text-[11px] font-semibold text-slate-600 border-b border-slate-200/40 pb-0.5 last:border-b-0">
                                    <span>{a.date}</span>
                                    <span className="text-emerald-700 font-extrabold bg-emerald-50 px-1.5 py-0.5 rounded-md">
                                      +{a.quantite} unités
                                    </span>
                                  </div>
                                ))
                              ) : (
                                <p className="text-[11px] text-slate-400 italic">
                                  Aucune livraison enregistrée pour cet article.
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </td>

                      <td className="p-2.5 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black border transition-all ${estEpuise ? "bg-red-50 border-red-200 text-red-700 animate-pulse" : estEnRupture ? "bg-amber-50 border-amber-200 text-amber-700 animate-pulse" : "bg-slate-50 border-slate-200 text-slate-800"}`}>
                          {estEpuise ? "ÉPUISÉ" : estEnRupture ? `⚠️ ALERTE (${p.quantiteStock})` : `${p.quantiteStock} unités`}
                        </span>
                      </td>

                      <td className="p-2.5 text-sm md:text-base font-bold text-slate-600 text-right tracking-tight">
                        {p.prixUnitaire.toLocaleString()} F
                      </td>

                      

                      <td className="p-2.5 text-right space-x-1 shrink-0">
                        <button type="button" disabled={estEnCours} onClick={() => { setProduitCibleApprov(p); setPopApprovOuverte(true); setQuantiteArrivage(""); }} className="bg-emerald-100 hover:bg-emerald-100 text-emerald-700 font-bold px-2.5 py-1 rounded-lg text-xs border border-emerald-200 transition cursor-pointer inline-flex items-center gap-1 active:scale-95 disabled:opacity-40"><PlusCircle size={12} /></button>
                        <button type="button" disabled={estEnCours} onClick={() => ouvrirPourModification(p)} className="p-1 text-amber-600 hover:text-amber-600 rounded-md hover:bg-amber-50 transition cursor-pointer inline-flex items-center disabled:opacity-40"><Edit2 size={13} /></button>
                        <button type="button" disabled={estEnCours} onClick={async () => {
                          if (confirm(`Voulez-vous retirer "${p.nom}" du catalogue ?`)) {
                            setEstEnCours(true);
                            const toastId = toast.loading(`Retrait de ${p.nom}...`);
                            const res = await supprimerProduitAction(p.id);
                            if (res.success) { toast.success(res.message, { id: toastId }); router.refresh(); }
                            else { toast.error(res.error, { id: toastId }); }
                            setEstEnCours(false);
                          }
                        }} className="p-1 text-red-600 hover:text-red-600 rounded-md hover:bg-red-50 transition cursor-pointer inline-flex items-center disabled:opacity-40"><Trash2 size={13} /></button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan={4} className="p-6 text-center text-xs font-semibold text-slate-400 bg-slate-50/50">Aucun article au catalogue.</td></tr>
              )}
            </tbody>


          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. POP-UP NOUVEAU PRODUIT / MODIFICATION (GLASSMORPHISM)                  */}
      {/* ========================================================================= */}
      {popProduitOuverte && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white/90 backdrop-blur-xl border border-slate-200 shadow-2xl rounded-2xl w-full max-w-sm p-5 space-y-4 relative animate-in zoom-in-95 duration-150">
            <button type="button" onClick={() => setPopProduitOuverte(false)} className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"><X size={15} /></button>
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-green-600 bg-green-50 border border-green-100 px-2 py-0.5 rounded-md">Fiche Catalogue</span>
              <h4 className="text-sm md:text-base font-black text-slate-900 tracking-tight pt-1">{idEnCorrection ? "Modifier la marchandise" : "Ajouter une marchandise"}</h4>
            </div>
            <form onSubmit={handleSoumissionProduit} className="space-y-3.5">
              {erreurFormulaire && <p className="text-xs font-semibold text-amber-700 bg-amber-50/50 p-2 rounded-xl border border-amber-200/50">{erreurFormulaire}</p>}
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">{"Désignation de l'article"}</label>
                <input type="text" required disabled={estEnCours} placeholder="ex: Sac de Maïs 50kg" value={nomProduit} onChange={(e) => setNomProduit(e.target.value)} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm md:text-base font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-green-500 focus:bg-white transition" />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Prix de vente (FCFA)</label>
                <input type="number" required disabled={estEnCours} placeholder="ex: 18500" value={prixProduit} onChange={(e) => setPrixProduit(e.target.value)} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm md:text-base font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-green-500 focus:bg-white transition" />
              </div>
              <div className="flex gap-2 pt-1">
                <button type="submit" disabled={estEnCours} className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs md:text-sm flex items-center justify-center gap-1.5 shadow-md transition cursor-pointer active:scale-[0.98]">{estEnCours ? <Loader2 className="animate-spin" size={14} /> : "Confirmer"}</button>
                <button type="button" onClick={() => setPopProduitOuverte(false)} className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs md:text-sm font-bold transition cursor-pointer">Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. POP-UP ARRIVAGE CAMION STOCK (GLASSMORPHISM)                           */}
      {/* ========================================================================= */}
      {popApprovOuverte && produitCibleApprov && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white/90 backdrop-blur-xl border border-slate-200 shadow-2xl rounded-2xl w-full max-w-sm p-5 space-y-4 relative animate-in zoom-in-95 duration-150">
            <button type="button" onClick={() => { setPopApprovOuverte(false); setProduitCibleApprov(null); }} className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"><X size={15} /></button>
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">Arrivage Marchandise</span>
              <h4 className="text-sm md:text-base font-black text-slate-900 tracking-tight pt-1">Stock : {produitCibleApprov.nom}</h4>
            </div>
            <form onSubmit={handleSoumissionArrivage} className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="qteArrivage" className="block text-xs font-bold uppercase tracking-wider text-slate-400">Quantité livrée au dépôt</label>
                <input id="qteArrivage" type="number" required disabled={estEnCours} placeholder="ex: 20" value={quantiteArrivage} onChange={(e) => setQuantiteArrivage(e.target.value)} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm md:text-base font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500" />
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={estEnCours || !quantiteArrivage} className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs md:text-sm flex items-center justify-center gap-1.5 shadow-md transition cursor-pointer active:scale-[0.98]">{estEnCours ? <Loader2 className="animate-spin" size={14} /> : "Confirmer l'ajout"}</button>
                <button type="button" onClick={() => { setPopApprovOuverte(false); setProduitCibleApprov(null); }} className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs md:text-sm font-bold transition cursor-pointer">Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}