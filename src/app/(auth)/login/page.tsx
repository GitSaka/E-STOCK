"use client";

import { useActionState, useState } from "react";
import { Lock, Phone, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
// Ajustement du chemin pour correspondre à notre structure d'actions
import { seConnecterAction, FormState } from "@/app/actions/auth/auth";

const initialActionState: FormState = {
  success: false,
};

export default function LoginPage() {
  const [state, formAction, estEnCoursDeChargement] = useActionState(
    seConnecterAction,
    initialActionState
  );

  const [afficherMotDePasse, setAfficherMotDePasse] = useState(false);

  return (
    // Correction v3 : 'bg-radial' remplacé par un dégradé radial CSS inline standard pour garder l'effet
    <div 
      className="min-h-screen flex items-center justify-center px-2 py-7 sm:px-6 lg:px-8 relative overflow-hidden"
      style={{ background: "radial-gradient(circle, #f8fafc 0%, #e2e8f0 100%)" }}
    >
      
      {/* Éléments de design d'arrière-plan */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-green-200/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-emerald-200/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Correction v3 : 'backdrop-blur-md' pour la compatibilité verre dépoli */}
      <div className="w-full max-w-md space-y-8 bg-white/80 backdrop-blur-md p-4 md:p-7 rounded-3xl shadow-2xl border border-white/60 relative z-10">
        
        {/* Identité visuelle de l'entreprise */}
        <div className="text-center">
          {/* Correction v3 : 'bg-gradient-to-tr from-green-600 to-emerald-500' */}
          <div className="mx-auto h-14 w-14 bg-gradient-to-tr from-green-600 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-green-600/30 ring-4 ring-green-50">
            <ShieldCheck className="text-white" size={28} />
          </div>
          {/* Correction v3 : 'bg-gradient-to-r from-slate-900 to-slate-700' */}
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            E-Stock & Crédits
          </h2>
          <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full w-max mx-auto border border-emerald-100">
            Porto-Novo, Bénin
          </p>
        </div>

        {/* Message d'erreur élégant */}
        {state?.error && (
          // Correction v3 : 'backdrop-blur-sm'
          <div className="p-4 text-sm text-red-700 bg-red-50/80 backdrop-blur-sm rounded-2xl border border-red-100 flex items-center gap-3">
            <span className="flex h-2 w-2 rounded-full bg-red-500 shrink-0" />
            <p className="font-medium">{state.error}</p>
          </div>
        )}

        {/* Formulaire connecté à la Server Action */}
        <form action={formAction} className="mt-8 space-y-6">
          <div className="space-y-5">
            
            {/* Champ Numéro de Téléphone */}
            <div className="group">
              <label htmlFor="telephone" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 group-focus-within:text-green-600 transition">
                Numéro de téléphone
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400 group-focus-within:text-green-500 transition">
                  <Phone size={18} />
                </div>
                <input
                  id="telephone"
                  name="telephone"
                  type="tel"
                  required
                  disabled={estEnCoursDeChargement}
                  placeholder="ex: 97000000"
                  className="block w-full pl-12 pr-4 py-3.5 text-slate-900 border border-slate-200 rounded-2xl bg-slate-50/40 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white transition shadow-sm hover:border-slate-300 disabled:opacity-60"
                />
              </div>
            </div>

            {/* Champ Mot de Passe */}
            <div className="group">
              <label htmlFor="motDePasse" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 group-focus-within:text-green-600 transition">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400 group-focus-within:text-green-500 transition">
                  <Lock size={18} />
                </div>
                <input
                  id="motDePasse"
                  name="motDePasse"
                  type={afficherMotDePasse ? "text" : "password"}
                  required
                  disabled={estEnCoursDeChargement}
                  placeholder="••••••••"
                  className="block w-full pl-12 pr-12 py-3.5 text-slate-900 border border-slate-200 rounded-2xl bg-slate-50/40 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white transition shadow-sm hover:border-slate-300 disabled:opacity-60"
                />
                <button
                  type="button"
                  disabled={estEnCoursDeChargement}
                  onClick={() => setAfficherMotDePasse(!afficherMotDePasse)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600 transition disabled:opacity-50"
                >
                  {afficherMotDePasse ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          {/* Bouton de validation Premium */}
          <div className="pt-2">
            {/* Correction v3 : 'bg-gradient-to-r from-green-600 to-emerald-600' */}
            <button
              type="submit"
              disabled={estEnCoursDeChargement}
              className="group relative flex w-full justify-center rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 px-4 py-4 text-base font-bold text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition cursor-pointer active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none shadow-xl shadow-green-600/20"
            >
              {estEnCoursDeChargement ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <span className="flex items-center gap-2">
                  Accéder à l'espace
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
