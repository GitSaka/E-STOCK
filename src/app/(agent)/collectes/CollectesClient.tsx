"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Landmark, User, Wallet, ArrowLeftRight, CheckCircle2, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

import { 
  enregistrerVersementAction, 
  corrigerVersementParIdAction,
  obtenirVersementsDuJourParCliente 
} from "@/app/actions/collectes";


// Définition de la structure de données attendue
interface ClienteFormatee {
  id: string;
  nom: string;
  telephone: string | null;
  soldeDette: number;
}

interface CollectesClientProps {
  listeClientes: ClienteFormatee[];
}

export default function CollectesClient({ listeClientes }: CollectesClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Extraction sécurisée de l'ID passé dans l'URL (?id=...)
  const clienteIdUrl = searchParams.get("id");

  // États réactifs pour piloter l'interface
  const [clienteSelectionnee, setClienteSelectionnee] = useState<ClienteFormatee | null>(null);
  const [montantSaisi, setMontantSaisi] = useState("");
  const [estEnCoursDeValidation, setEstEnCoursDeValidation] = useState(false);
  const [messageSucces, setMessageSucces] = useState(false);
  const [erreurServeur, setErreurServeur] = useState<string | null>(null);

  const [dernierMontantNeon, setDernierMontantNeon] = useState<number | null>(null);

  

  

  // Interface locale pour TypeScript
  interface CollecteLigneType {
    id: string;
    montant: number;
    heure: string;
  }

  // Stocke l'ID exact de la ligne que le Zem a cliqué pour corriger
  const [idLigneEnCorrection, setIdLigneEnCorrection] = useState<string | null>(null);
  // Reçoit le tableau de tous les montants saisis aujourd'hui pour cette maman
  const [collectesMaman, setCollectesMaman] = useState<CollecteLigneType[]>([]);

  // Charge et rafraîchit automatiquement l'historique de la maman
  useEffect(() => {
    if (clienteSelectionnee) {
      obtenirVersementsDuJourParCliente(clienteSelectionnee.id).then((donnees) => {
        setCollectesMaman(donnees);
      });
    } else {
      setCollectesMaman([]);
    }
  }, [clienteSelectionnee, messageSucces]);


  // Écouteur : si un ID est présent dans l'URL, on pré-charge automatiquement la bonne dame
  useEffect(() => {
    if (clienteIdUrl && listeClientes.length > 0) {
      const trouvee = listeClientes.find((c) => c.id === clienteIdUrl);
      if (trouvee) setClienteSelectionnee(trouvee);
    }
  }, [clienteIdUrl, listeClientes]);

    // Fonction chirurgicale qui gère la soumission (Création OU Modification sans doublon)
  const handleSoumissionVersement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteSelectionnee || montantAEncaisser <= 0) return;

    setEstEnCoursDeValidation(true);
    setErreurServeur(null);

    let reponse;

    // Si on a un ID en mémoire, on modifie la ligne existante, sinon on crée
    if (idLigneEnCorrection) {
      reponse = await corrigerVersementParIdAction(idLigneEnCorrection, montantAEncaisser);
    } else {
      reponse = await enregistrerVersementAction(clienteSelectionnee.id, montantAEncaisser);
    }

    if (reponse.success) {
      setMessageSucces(true);
      setMontantSaisi("");
      setIdLigneEnCorrection(null); // On remet à zéro après la correction
      
      setTimeout(() => {
        setMessageSucces(false);
        router.push("/mobile-dashboard");
        router.refresh();
      }, 1500);
    } else {
      setErreurServeur(reponse.error || "Une erreur est survenue.");
      setEstEnCoursDeValidation(false);
    }
  };


  // Variables de calculs pour la simulation financière en direct
  const montantAEncaisser = parseFloat(montantSaisi) || 0;
  const soldeActuel = clienteSelectionnee ? clienteSelectionnee.soldeDette : 0;
  const nouveauSoldeCalcule = soldeActuel - montantAEncaisser;
  
  const estUnSurplus = nouveauSoldeCalcule < 0;
  const estAujour = nouveauSoldeCalcule === 0;  

  return (
    <div className="w-full max-w-xl mx-auto space-y-3 px-2">
      
      {/* BOUTON RETOUR PRESTIGE */}
      <div className="flex items-center gap-2">
        <Link 
          href="/mobile-dashboard" 
          className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-green-600 bg-white border border-slate-200 px-2.5 py-1.5 rounded-xl shadow-2xs transition cursor-pointer"
        >
          <ArrowLeft size={14} /> Retour à la liste
        </Link>
      </div>

      {/* SÉLECTEUR DE CLIENTE : Masqué si l'agent a cliqué sur une maman depuis l'accueil */}
      {!clienteIdUrl && (
        <div className="bg-white border border-slate-200 p-3 rounded-2xl shadow-2xs">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Sélectionner la Bonne Dame
          </label>
          <select
            onChange={(e) => {
              const trouvee = listeClientes.find((c) => c.id === e.target.value);
              setClienteSelectionnee(trouvee || null);
              setErreurServeur(null);
            }}
            className="block w-full p-2.5 text-xs text-slate-900 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-1 focus:ring-green-500 cursor-pointer"
            value={clienteSelectionnee?.id || ""}
          >
            <option value="" disabled>--- Choisir une maman sur le marché ---</option>
            {listeClientes.map((c) => (
              <option key={c.id} value={c.id}>{c.nom}</option>
            ))}
          </select>
        </div>
      )}
      {/* CARD PROFIL CLIENTE ET FORMULAIRE DE SAISIE */}
      {erreurServeur && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-medium animate-in fade-in duration-200">
          {erreurServeur}
        </div>
      )}

      {messageSucces && (
        <div className="p-4 bg-emerald-600 text-white rounded-2xl flex items-center gap-3 shadow-lg shadow-emerald-600/20 animate-in fade-in duration-300">
          <CheckCircle2 size={24} className="shrink-0 animate-bounce" />
          <div>
            <p className="text-sm font-bold">Versement enregistré !</p>
            <p className="text-[11px] text-emerald-100 font-medium">Transmis aux chefs pour validation ce soir.</p>
          </div>
        </div>
      )}

      {clienteSelectionnee && (
        <form 
          onSubmit={handleSoumissionVersement}
          className="space-y-3"
        >
          {/* CARTE PROFIL CLIENTE GLASSMORPHISM */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-3 shadow-2xs relative overflow-hidden transition hover:shadow-xs">
            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-full pointer-events-none -z-10" />
            
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Fix Tailwind v3 : bg-gradient-to-tr */}
                <div className="h-9 w-9 bg-gradient-to-tr from-slate-800 to-slate-700 rounded-xl flex items-center justify-center text-slate-200 shadow-xs shrink-0">
                  <User size={16} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-black text-slate-800 truncate leading-tight">{clienteSelectionnee.nom}</h3>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">{clienteSelectionnee.telephone || "Aucun numéro enregistré"}</p>
                </div>
              </div>

              {/* Solde actuel de la maman avant encaissement */}
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

          {/* SAISIE DU MONTANT EN ESPECES */}

  
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

            {/* CALCULATEUR DE SURPLUS EN DIRECT */}
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
            {/* Fix Tailwind v3 : bg-gradient-to-r */}

                        {/* LISTE DES COLLECTES DE LA JOURNÉE POUR CETTE MAMAN */}
            <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-2xs space-y-2 mt-2">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Saisies de la journée pour cette maman
              </h4>
              
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {collectesMaman && collectesMaman.length > 0 ? (
                  collectesMaman.map((c: CollecteLigneType) => (
                    <div 
                      key={c.id} 
                      className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200/60 rounded-xl text-xs animate-in fade-in duration-150"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-slate-200 text-slate-600 font-bold px-1.5 py-0.5 rounded-md">
                          {c.heure}
                        </span>
                        <span className="font-black text-slate-800">
                          {c.montant.toLocaleString()} FCFA
                        </span>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => {
                          setMontantSaisi(c.montant.toString());
                          setIdLigneEnCorrection(c.id); // Verrouille l'ID précis pour Neon
                          setErreurServeur("Mode correction actif : modifiez la somme et re-validez.");
                        }}
                        className="text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-lg transition active:scale-95 cursor-pointer"
                      >
                        Modifier
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-[11px] text-slate-400 text-center py-2">
                    Aucun versement enregistré aujourd'hui pour cette maman.
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={estEnCoursDeValidation || montantAEncaisser <= 0 || messageSucces}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3.5 rounded-xl transition cursor-pointer active:scale-[0.99] disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2 shadow-lg shadow-green-600/10 text-sm"
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
        </form>
      )}
    </div>
  );
}
