"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { Decimal } from "@prisma/client/runtime/library";


// 1. FONCTION DE CRÉATION UNIQUE (Chaque clic crée une nouvelle ligne propre)
export async function enregistrerVersementAction(clienteId: string, montant: number) {
  if (!clienteId || montant <= 0) {
    return { success: false, error: "Données invalides." };
  }

  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session_gestion_stock");

    if (!sessionCookie) {
      return { success: false, error: "Session expirée. Veuillez vous reconnecter." };
    }

    const session = JSON.parse(sessionCookie.value);
    const agentId = session.id;

    // Crée une nouvelle ligne indépendante dans Neon
    await prisma.fluxVersement.create({
      data: {
        montantVerse: montant,
        statut: "EN_ATTENTE",
        clienteId: clienteId,
        agentId: agentId,
      },
    });

    return { success: true, message: "Versement enregistré !" };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Erreur de liaison avec le serveur cloud." };
  }
}

// 2. FONCTION DE MODIFICATION CIBLÉE (Modifie uniquement LA ligne sélectionnée via son ID)
export async function corrigerVersementParIdAction(versementId: string, nouveauMontant: number) {
  if (!versementId || nouveauMontant <= 0) {
    return { success: false, error: "Données invalides pour la correction." };
  }

  try {
    // Sécurité stricte : On met à jour la ligne précise cible
    await prisma.fluxVersement.update({
      where: { id: versementId },
      data: { 
        montantVerse: nouveauMontant,
        dateCollecte: new Date() // Réajuste l'heure de la correction
      },
    });

    return { success: true, message: "La correction a bien été enregistrée !" };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Impossible d'appliquer la modification sur Neon." };
  }
}

// 3. RECUPERATION DES SAISIES DU JOUR POUR CETTE MAMAN (Pour l'affichage de contrôle)
export async function obtenirVersementsDuJourParCliente(clienteId: string) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session_gestion_stock");
    if (!sessionCookie) return [];

    const session = JSON.parse(sessionCookie.value);
    const agentId = session.id;

    const debutJournee = new Date();
    debutJournee.setHours(0, 0, 0, 0);

    const collectes = await prisma.fluxVersement.findMany({
      where: {
        clienteId,
        agentId,
        statut: "EN_ATTENTE",
        dateCollecte: { gte: debutJournee }
      },
      orderBy: { dateCollecte: "desc" },
      select: {
        id: true,
        montantVerse: true,
        dateCollecte: true
      }
    });

    interface PrismaCollecteRow {
      id: string;
      montantVerse: Decimal; // Type Decimal de Prisma
      dateCollecte: Date;
    }

    return collectes.map((c: PrismaCollecteRow) => ({
      id: c.id,
      montant: Number(c.montantVerse),
      heure: c.dateCollecte.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
    }));
    
  } catch {
    return [];
  }
}
