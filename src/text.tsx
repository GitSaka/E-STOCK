"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Landmark, User, Wallet, ArrowLeftRight, CheckCircle2, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

// Liste miroir pour simuler les données de la base Neon en attendant l'API
const CLIENTES_TEST = [
  { id: "1", nom: "Maman Chantal", telephone: "97000101", soldeDette: 45000 },
  { id: "2", nom: "Tantie Ablawa", telephone: "96123456", soldeDette: 120000 },
  { id: "3", nom: "Maman Douceur", telephone: "90887766", soldeDette: -5000 },
  { id: "4", nom: "Yabo Grâce", telephone: "61002233", soldeDette: 0 },
  { id: "5", nom: "Maman Bénie", telephone: "95443322", soldeDette: 15000 },
];

export default function CollectesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Extraction sécurisée du paramètre de l'URL (?id=...)
  const clienteIdUrl = searchParams.get("id");

  // États réactifs de l'interface utilisateur
  const [clienteSelectionnee, setClienteSelectionnee] = useState<typeof CLIENTES_TEST[0] | null>(null);
  const [montantSaisi, setMontantSaisi] = useState("");
  const [estEnCoursDeValidation, setEstEnCoursDeValidation] = useState(false);
  const [messageSucces, setMessageSucces] = useState(false);

  // Écouteur pour charger la cliente si elle provient d'un clic du tableau de bord
  useEffect(() => {
    if (clienteIdUrl) {
      const trouvee = CLIENTES_TEST.find((c) => c.id === clienteIdUrl);
      if (trouvee) setClienteSelectionnee(trouvee);
    }
  }, [clienteIdUrl]);

  // Constantes de calculs dynamiques (Moteur de calcul du surplus)
  const montantAEncaisser = parseFloat(montantSaisi) || 0;
  const soldeActuel = clienteSelectionnee ? clienteSelectionnee.soldeDette : 0;
  const nouveauSoldeCalcule = soldeActuel - montantAEncaisser;
  
  const estUnSurplus = nouveauSoldeCalcule < 0;
  const estAujour = nouveauSoldeCalcule === 0;  

  // Fonction de soumission du versement à l'API
  const handleValidationVersement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteSelectionnee || montantAEncaisser <= 0) return;

    setEstEnCoursDeValidation(true);

    try {
      // Simulation d'envoi réseau vers l'API Node.js/Neon
      console.log("Envoi du versement :", {
        clienteId: clienteSelectionnee.id,
        montant: montantAEncaisser,
        statut: "EN_ATTENTE"
      });
      
      await new Promise((resolve) => setTimeout(resolve, 1200));
      
      setMessageSucces(true);
      setMontantSaisi("");
      
      setTimeout(() => {
        setMessageSucces(false);
        router.push("/mobile-dashboard");
      }, 1500);

    } catch (error) {
      console.error(error);
    } finally {
      setEstEnCoursDeValidation(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-3">
      
      {/* BOUTON RETOUR PRESTIGE ET DISCRET */}
      <div className="flex items-center gap-2">
        <Link 
          href="/mobile-dashboard" 
          className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-green-600 bg-white border border-slate-200 px-2.5 py-1.5 rounded-xl shadow-2xs transition cursor-pointer"
        >
          <ArrowLeft size={14} /> Retour à la liste
        </Link>
      </div>

      {/* MESSAGE DE SUCCÈS ANIMÉ */}
      {messageSucces && (
        <div className="p-4 bg-emerald-600 text-white rounded-2xl flex items-center gap-3 shadow-lg shadow-emerald-600/20 animate-in fade-in duration-300">
          <CheckCircle2 size={24} className="shrink-0 animate-bounce" />
          <div>
            <p className="text-sm font-bold">Versement enregistré !</p>
            <p className="text-[11px] text-emerald-100 font-medium">Transmis aux chefs pour validation ce soir.</p>
          </div>
        </div>
      )}

      {/* FORMULAIRE DE COLLECTE */}
      <form onSubmit={handleValidationVersement} className="space-y-3">
        
        {/* SÉLECTEUR DE CLIENTE (Affiché uniquement si pas d'ID dans l'URL) */}
        {!clienteIdUrl && (
          <div className="bg-white border border-slate-200 p-3 rounded-2xl shadow-2xs">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Sélectionner la Bonne Dame
            </label>
            <select
              onChange={(e) => {
                const trouvee = CLIENTES_TEST.find((c) => c.id === e.target.value);
                setClienteSelectionnee(trouvee || null);
              }}
              className="block w-full p-2.5 text-xs text-slate-900 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-1 focus:ring-green-500 cursor-pointer"
              defaultValue=""
            >
              <option value="" disabled>--- Choisir une maman sur le marché ---</option>
              {CLIENTES_TEST.map((c) => (
                <option key={c.id} value={c.id}>{c.nom}</option>
              ))}
            </select>
          </div>
        )}

        {/* CARTE PROFIL CLIENTE GLASSMORPHISM */}
        {clienteSelectionnee && (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-3 shadow-2xs relative overflow-hidden transition hover:shadow-xs">
            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-full pointer-events-none -z-10" />
            
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-9 w-9 bg-linear-to-tr from-slate-800 to-slate-700 rounded-xl flex items-center justify-center text-slate-200 shadow-xs shrink-0">
                  <User size={16} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-black text-slate-800 truncate leading-tight">{clienteSelectionnee.nom}</h3>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">{clienteSelectionnee.telephone || "Aucun numéro enregistré"}</p>
                </div>
              </div>

              {/* Solde d'origine avant saisie */}
              <div className="text-right shrink-0">
                <p className={`text-xs font-black tracking-tight ${clienteSelectionnee.soldeDette > 0 ? "text-red-600" : clienteSelectionnee.soldeDette < 0 ? "text-green-600" : "text-slate-500"}`}>
                  {Math.abs(clienteSelectionnee.soldeDette).toLocaleString()} FCFA
                </p>
                <p className="text-[8px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
                  {clienteSelectionnee.soldeDette > 0 ? "Dette Initiale" : clienteSelectionnee.soldeDette < 0 ? "Avance Initiale" : "À jour"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ZONE DE SAISIE DU MONTANT (Gros chiffres, pavé numérique forcé) */}
        {clienteSelectionnee && (
          <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-2xs space-y-3">
            <div>
              <label htmlFor="montant" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Montant encaissé en espèces
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <Wallet size={16} />
                </div>
                <input
                  id="montant"
                  type="number"
                  inputMode="numeric"
                  required
                  disabled={estEnCoursDeValidation || messageSucces}
                  placeholder="0"
                  value={montantSaisi}
                  onChange={(e) => setMontantSaisi(e.target.value)}
                  className="block w-full pl-10 pr-16 py-3 text-lg font-black text-slate-900 border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white transition"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none">
                  <span className="text-xs font-black text-slate-400 tracking-wider">FCFA</span>
                </div>
              </div>
            </div>

            {/* LE CALCULATEUR DE SURPLUS / AVANCE EN DIRECT */}
            {montantAEncaisser > 0 && (
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/60 text-xs space-y-1.5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between text-slate-500 font-medium">
                  <span className="flex items-center gap-1"><ArrowLeftRight size={12} /> Simulation du compte :</span>
                  <span>{soldeActuel.toLocaleString()} - {montantAEncaisser.toLocaleString()}</span>
                </div>
                
                <div className="flex items-center justify-between pt-1 border-t border-slate-200/80">
                  <span className="font-bold text-slate-700">Futur solde calculé :</span>
                  <div className="text-right">
                    <span className={`font-black text-sm tracking-tight ${estUnSurplus ? "text-green-600" : estAujour ? "text-slate-600" : "text-red-600"}`}>
                      {Math.abs(nouveauSoldeCalcule).toLocaleString()} FCFA
                    </span>
                    <p className={`text-[8px] font-black uppercase tracking-wider leading-none mt-0.5 ${estUnSurplus ? "text-green-600" : estAujour ? "text-slate-500" : "text-red-600"}`}>
                      {estUnSurplus ? "🎉 Surplus (Prochaine Avance)" : estAujour ? "Dette Éteinte" : "Reste à payer"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* BOUTON DE VALIDATION DE L'ENCAISSEMENT */}
            <button
              type="submit"
              disabled={estEnCoursDeValidation || montantAEncaisser <= 0 || messageSucces}
              className="w-full bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3.5 rounded-xl transition cursor-pointer active:scale-[0.99] disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2 shadow-lg shadow-green-600/10 text-sm"
            >
              {estEnCoursDeValidation ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  <Landmark size={16} />
                  Enregistrer le versement
                </>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}




// Pages produits

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Package, Sparkles, Loader2, Edit2, PlusCircle, 
  AlertTriangle, DollarSign, Layers, X, 
  Trash2
} from "lucide-react";
import { toast } from "sonner";
import { 
  sauvegarderProduitAction, 
  approvisionnerProduitAction, 
  supprimerProduitAction
} from "@/app/actions/produits";

// Structure de données stricte correspondant à Neon
interface ProduitType {
  id: string;
  nom: string;
  quantiteStock: number;
  prixUnitaire: number;
}

interface ProduitsClientProps {
  initialProduits: ProduitType[];
}

export default function ProduitsClient({ initialProduits }: ProduitsClientProps) {
  const router = useRouter();

  // États généraux de chargement et d'alertes
  const [estEnCours, setEstEnCours] = useState(false);
  const [erreurFormulaire, setErreurFormulaire] = useState<string | null>(null);

  // ÉTAT CRUD PRODUIT : Retient la ligne si on clique sur le petit crayon de modification
  const [idEnCorrection, setIdEnCorrection] = useState<string | null>(null);
  const [nomProduit, setNomProduit] = useState("");
  const [prixProduit, setPrixProduit] = useState("");

  // ÉTAT POP-UP ARRIVAGE (GLASSMORPHISM) : Contrôle la fenêtre d'entrée de stock (+6 sacs)
  const [popApprovOuverte, setPopApprovOuverte] = useState(false);
  const [produitCibleApprov, setProduitCibleApprov] = useState<ProduitType | null>(null);
  const [quantiteArrivage, setQuantiteArrivage] = useState("");

  // =========================================================================
  // MOTEUR DE CALCUL DES CARTES DE STATISTIQUES ÉPURÉES (VALEUR DU DÉPÔT)
  // =========================================================================
  // Multiplie la quantité en stock par le prix unitaire pour chaque article
  const valeurTotaleStock = initialProduits.reduce(
    (sum, p) => sum + p.quantiteStock * p.prixUnitaire, 0
  );
  
  // Compte le nombre total cumulé de sacs/bidons présents physiquement
  const volumeTotalArticles = initialProduits.reduce(
    (sum, p) => sum + p.quantiteStock, 0
  );

  // Vérifie si au moins un produit est en alerte de rupture (Moins de 5 sacs)
  const aDesAlertesRupture = initialProduits.some(p => p.quantiteStock < 5);

  // Activation du mode correction pour un produit existant
  const activerModificationProduit = (p: ProduitType) => {
    setIdEnCorrection(p.id);
    setNomProduit(p.nom);
    setPrixProduit(p.prixUnitaire.toString());
    setErreurFormulaire("Mode modification actif pour ce produit.");
  };

  // Annuler proprement le mode modification
  const annulerModification = () => {
    setIdEnCorrection(null);
    setNomProduit("");
    setPrixProduit("");
    setErreurFormulaire(null);
  };
  // =========================================================================
  // LOGIQUE ACTIONS SERVEUR : VALIDER LE PRODUIT (CRÉATION OU UPDATE)
  // =========================================================================
  const handleSoumissionProduit = async (e: React.FormEvent) => {
    e.preventDefault();
    const prixNum = parseFloat(prixProduit);
    if (!nomProduit.trim() || isNaN(prixNum) || prixNum <= 0) return;

    setEstEnCours(true);
    setErreurFormulaire(null);
    const toastId = toast.loading(idEnCorrection ? "Mise à jour du produit..." : "Ajout du produit au catalogue...");

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
      router.refresh();
    } else {
      toast.error(res.error || "Une erreur est survenue.", { id: toastId });
      setErreurFormulaire(res.error || "Échec de l'enregistrement.");
    }
    setEstEnCours(false);
  };

  // =========================================================================
  // LOGIQUE ACTIONS SERVEUR : VALIDATION DE L'ARRIVAGE DU CAMION
  // =========================================================================
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

      {/* DISPOSITION EN DOUBLE COLONNE COMPACTE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        
        {/* COLONNE GAUCHE (1/3) : FORMULAIRE DU CATALOGUE PRODUITS */}
        <form onSubmit={handleSoumissionProduit} className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs space-y-3.5 self-start">
          <h3 className="text-xs md:text-sm font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
            <Package size={14} className="text-green-600" />
            {idEnCorrection ? "Modifier la Marchandise" : "Nouvelle Marchandise"}
          </h3>

          {erreurFormulaire && (
            <p className="text-xs font-semibold text-amber-700 bg-amber-50/50 p-2 rounded-xl border border-amber-200/50">
              {erreurFormulaire}
            </p>
          )}

          <div className="space-y-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Désignation du produit</label>
            <input type="text" required disabled={estEnCours} placeholder="ex: Sac de Riz 50kg" value={nomProduit} onChange={(e) => setNomProduit(e.target.value)} className="w-full px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm md:text-base font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-green-500 focus:bg-white transition" />
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Prix de vente unitaire (FCFA)</label>
            <input type="number" required disabled={estEnCours} placeholder="ex: 18500" value={prixProduit} onChange={(e) => setPrixProduit(e.target.value)} className="w-full px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm md:text-base font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-green-500 focus:bg-white transition" />
          </div>

          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={estEnCours} className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs md:text-sm flex items-center justify-center gap-1.5 shadow-xs transition active:scale-95">
              {estEnCours ? <Loader2 className="animate-spin" size={14} /> : idEnCorrection ? "Sauvegarder" : "Enregistrer l'article"}
            </button>
            {idEnCorrection && (
              <button type="button" onClick={annulerModification} className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs md:text-sm font-bold transition">
                Annuler
              </button>
            )}
          </div>
        </form>
        {/* COLONNE DROITE (2/3) : LE GRAND TABLEAU DE L'INVENTAIRE DU DÉPÔT */}
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-xs overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[500px]">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <th className="p-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Marchandise</th>
                <th className="p-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 text-right">Prix Unitaire</th>
                <th className="p-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">Stock Disponible</th>
                <th className="p-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 text-right">Actions métiers</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {initialProduits.length > 0 ? (
                initialProduits.map((p) => {
                  const estEnRupture = p.quantiteStock < 5;
                  const estEpuise = p.quantiteStock === 0;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/40 bg-white transition font-medium">
                      
                      {/* 1. NOM DE LA MARCHANDISE */}
                      <td className="p-2.5 text-sm font-black text-slate-950">
                        {p.nom}
                      </td>

                      {/* 2. PRIX UNITAIRE STANDARD */}
                      <td className="p-2.5 text-sm font-bold text-slate-600 text-right tracking-tight">
                        {p.prixUnitaire.toLocaleString()} F
                      </td>

                      {/* 3. QUANTITÉ RESTE AU DÉPÔT AVEC ALERTE LUMINEUSE */}
                      <td className="p-2.5 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black border transition-all ${
                          estEpuise
                            ? "bg-red-50 border-red-200 text-red-700 font-extrabold animate-pulse"
                            : estEnRupture
                            ? "bg-amber-50 border-amber-200 text-amber-700 animate-pulse"
                            : "bg-slate-50 border-slate-200 text-slate-800"
                        }`}>
                          {estEpuise ? (
                            "ÉPUISÉ (0 sac)"
                          ) : estEnRupture ? (
                            `⚠️ ALERTE (${p.quantiteStock} sacs)`
                          ) : (
                            `${p.quantiteStock} en stock`
                          )}
                        </span>
                      </td>

                      {/* 4. ACTIONS DU SCRIPT : MODIFICATION OU DISPATCH DE LA POP-UP */}
                      <td className="p-2.5 text-right space-x-1 shrink-0">
                        {/* BOUTON CHIRURGICAL ARRIVAGE CAMION */}
                        <button
                          type="button"
                          disabled={estEnCours}
                          onClick={() => {
                            setProduitCibleApprov(p);
                            setPopApprovOuverte(true);
                            setQuantiteArrivage("");
                          }}
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold px-2.5 py-1 rounded-lg text-[11px] border border-emerald-200 transition cursor-pointer inline-flex items-center gap-1 active:scale-95 disabled:opacity-40"
                        >
                          <PlusCircle size={12} /> Arrivage
                        </button>

                        {/* BOUTON ÉDITER D’IDENTITÉ */}
                        <button 
                          type="button" 
                          disabled={estEnCours}
                          onClick={() => activerModificationProduit(p)} 
                          className="p-1 text-slate-400 hover:text-amber-600 rounded-md hover:bg-amber-50 transition cursor-pointer inline-flex items-center disabled:opacity-40"
                        >
                          <Edit2 size={13} />
                        </button>

                                                {/* BOUTON ÉDITER D’IDENTITÉ */}
                        <button 
                          type="button" 
                          disabled={estEnCours} 
                          onClick={() => activerModificationProduit(p)} 
                          className="p-1 text-slate-400 hover:text-amber-600 rounded-md hover:bg-amber-50 transition cursor-pointer inline-flex items-center disabled:opacity-40"
                        >
                          <Edit2 size={13} />
                        </button>

                        {/* 🟢 NOUVEAU BOUTON : SUPPRESSION SÉCURISÉE DE MARCHANDISE */}
                        <button 
                          type="button" 
                          disabled={estEnCours}
                          onClick={async () => {
                            if (confirm(`Voulez-vous vraiment retirer le produit "${p.nom}" du catalogue ?`)) {
                              setEstEnCours(true);
                              setErreurFormulaire(null);
                              const toastId = toast.loading(`Retrait de ${p.nom} du stock...`);
                              
                              const res = await supprimerProduitAction(p.id);
                              
                              if (res.success) {
                                toast.success(res.message || "Produit effacé.", { id: toastId });
                                setNomProduit("");
                                setPrixProduit("");
                                setIdEnCorrection(null);
                                router.refresh(); // Rafraîchit le catalogue instantanément
                              } else {
                                toast.error(res.error || "Action refusée.", { id: toastId });
                                setErreurFormulaire(res.error || "Impossible de supprimer cet article.");
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
                    Aucun article répertorié dans le catalogue du dépôt.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. FENÊTRE POP-UP EFFET VERRE POLI GLASSMORPHISM (ARRIVAGE CAMION STOCK)  */}
      {/* ========================================================================= */}
      {popApprovOuverte && produitCibleApprov && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          
          {/* Boîte de dialogue épurée Glassmorphism */}
          <div className="bg-white/90 backdrop-blur-xl border border-slate-200 shadow-2xl rounded-2xl w-full max-w-sm p-5 space-y-4 relative animate-in zoom-in-95 duration-200">
            
            {/* Bouton de fermeture d'urgence */}
            <button 
              type="button" 
              onClick={() => { setPopApprovOuverte(false); setProduitCibleApprov(null); }}
              className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              <X size={15} />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">
                Entrée de Stock physique
              </span>
              <h4 className="text-sm md:text-base font-black text-slate-900 tracking-tight pt-1">
                Arrivage : {produitCibleApprov.nom}
              </h4>
              <p className="text-[11px] font-medium text-slate-400">
                {"Saisissez le nombre de sacs ou bidons livrés par le fournisseur. Le logiciel fera l'addition automatique."}
              </p>
            </div>

            <form onSubmit={handleSoumissionArrivage} className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="qteArrivage" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Quantité reçue au dépôt
                </label>
                <input
                  id="qteArrivage"
                  type="number"
                  required
                  disabled={estEnCours}
                  placeholder="ex: 12"
                  value={quantiteArrivage}
                  onChange={(e) => setQuantiteArrivage(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm md:text-base font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white transition"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={estEnCours || !quantiteArrivage}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs md:text-sm flex items-center justify-center gap-1.5 shadow-md shadow-green-600/10 transition cursor-pointer active:scale-[0.98]"
                >
                  {estEnCours ? <Loader2 className="animate-spin" size={14} /> : "Confirmer l'ajout"}
                </button>
                <button
                  type="button"
                  onClick={() => { setPopApprovOuverte(false); setProduitCibleApprov(null); }}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs md:text-sm font-bold transition cursor-pointer"
                >
                  Annuler
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
