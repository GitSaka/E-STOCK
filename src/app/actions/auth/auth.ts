"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Type pour structurer proprement la réponse renvoyée à notre formulaire
export type FormState = {
  success: boolean;
  error?: string;
};

export async function seConnecterAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const telephone = formData.get("telephone") as string;
  const motDePasse = formData.get("motDePasse") as string;

  // 1. Validation de sécurité de base
  if (!telephone || !motDePasse) {
    return { success: false, error: "Veuillez remplir tous les champs." };
  }

  // Variable pour stocker le rôle et gérer la redirection en dehors du bloc try/catch
  let roleUtilisateur: "CHEF" | "AGENT" | "SUPER_ADMIN" | null = null;

  try {
    // 2. Recherche de l'utilisateur dans la base Neon
    const utilisateur = await prisma.user.findUnique({
      where: { telephone },
    });

    if (!utilisateur) {
      return { success: false, error: "Numéro de téléphone ou mot de passe incorrect." };
    }

    // 3. Vérification du mot de passe avec bcryptjs
    const motDePasseCorrect = await bcrypt.compare(motDePasse, utilisateur.motDePasse);

    if (!motDePasseCorrect) {
      return { success: false, error: "Numéro de téléphone ou mot de passe incorrect." };
    }

    // 4. Création de la session sécurisée (Cookie HTTP-Only)
     const donneesSession = JSON.stringify({
      id: utilisateur.id,
      role: utilisateur.role,
    });

    const cookieStore = await cookies();
    cookieStore.set("session_gestion_stock", donneesSession, {
      httpOnly: true, // Protège contre les attaques XSS
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // Session active pendant 7 jours
      path: "/",
    });

    // Enregistrement du rôle pour la redirection automatique
    roleUtilisateur = utilisateur.role;

  } catch (error) {
    console.error("Erreur serveur lors de la connexion :", error);
    return { success: false, error: "Une erreur technique est survenue." };
  }

  // 5. Redirection intelligente selon le rôle métier (Toujours en dehors du bloc try/catch)
  if (roleUtilisateur === "CHEF" || roleUtilisateur === "SUPER_ADMIN") {
    redirect("/dashboard");
  } else if (roleUtilisateur === "AGENT") {
    redirect("/mobile-dashboard");
  }

  return { success: true };
}