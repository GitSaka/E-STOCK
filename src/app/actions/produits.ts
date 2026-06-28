"use server";

import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";

// 1. SAUVEGARDE UNIFIÉE D'UN PRODUIT (AVEC SÉCURITÉ ANTI-DOUBLON DE CASSE)
export async function sauvegarderProduitAction(data: {
  id?: string | null;
  nom: string;
  prixUnitaire: number;
}) {
  if (!data.nom.trim() || data.prixUnitaire <= 0) {
    return { success: false, error: "Le nom et un prix valide sont obligatoires." };
  }

  try {
    const nomSaisi = data.nom.trim();

    // -------------------------------------------------------------------------
    // CAS A : MODE MODIFICATION (Un ID est fourni)
    // -------------------------------------------------------------------------
    if (data.id) {
      // Sécurité : Cherche si un AUTRE produit a le même nom (sans vérifier les majuscules/minuscules)
      const nomPris = await prisma.produit.findFirst({
        where: {
          nom: {
            equals: nomSaisi,
            mode: "insensitive" // 🟢 Verrou magique : bloque "Huile" vs "HUILE"
          },
          NOT: { id: data.id }
        }
      });
      if (nomPris) return { success: false, error: "Ce produit existe déjà sous cette orthographe au catalogue." };

      await prisma.produit.update({
        where: { id: data.id },
        data: { nom: nomSaisi, prixUnitaire: new Decimal(data.prixUnitaire) }
      });

      return { success: true, message: "Le produit a été mis à jour avec succès !" };
    }

    // -------------------------------------------------------------------------
    // CAS B : MODE CRÉATION CLASSIQUE (Aucun ID fourni)
    // -------------------------------------------------------------------------
    // Sécurité : Vérifie si le produit existe déjà, peu importe la casse
    const produitExiste = await prisma.produit.findFirst({ 
      where: { 
        nom: {
          equals: nomSaisi,
          mode: "insensitive" // 🟢 Verrou magique à la création
        }
      } 
    });
    if (produitExiste) return { success: false, error: "Ce produit existe déjà dans votre inventaire (Vérifiez les majuscules)." };

    await prisma.produit.create({
      data: { 
        nom: nomSaisi, 
        prixUnitaire: new Decimal(data.prixUnitaire), 
        quantiteStock: 0 
      }
    });

    return { success: true, message: "Nouvel article ajouté au catalogue !" };

  } catch (error) {
    console.error("Erreur lors de la sauvegarde du produit :", error);
    return { success: false, error: "Erreur de communication avec le serveur cloud Neon." };
  }
}

// 2. ENREGISTRER UN ARRIVAGE DE CAMION (TRANSACTION COMMERCIALE SÉCURISÉE)
export async function approvisionnerProduitAction(produitId: string, quantite: number) {
  if (!produitId || quantite <= 0) {
    return { success: false, error: "Quantité d'arrivage invalide." };
  }

  try {
    await prisma.$transaction([
      prisma.approvisionnement.create({
        data: { produitId, quantite }
      }),
      prisma.produit.update({
        where: { id: produitId },
        data: { quantiteStock: { increment: quantite } }
      })
    ]);

    return { success: true, message: `Le stock de l'entrepôt a été augmenté de +${quantite} unités.` };
  } catch (error) {
    console.error("Erreur lors de la transaction d'approvisionnement :", error);
    return { success: false, error: "Impossible de valider l'entrée de stock sur Neon." };
  }
}

// 3. SUPPRESSION SÉCURISÉE D'UN PRODUIT DU CATALOGUE

export async function supprimerProduitAction(id: string) {
  if (!id) return { success: false, error: "Identifiant de marchandise invalide." };

  try {
    // SÉCURITÉ COMPTABLE INTERDITE : On bloque UNIQUEMENT si le produit est lié à une dette active
    const aDesVentes = await prisma.ligneVenteCredit.count({ where: { produitId: id } });
    if (aDesVentes > 0) {
      return { 
        success: false, 
        error: "Suppression refusée. Cet article apparaît sur d'anciennes factures de ventes à crédit." 
      };
    }

    // ACTION NETTOYANTE CASCADE : Prisma efface tout en un bloc sur Neon
    await prisma.$transaction([
      // Étape 1 : On nettoie et vide tout l'historique d'arrivages lié à ce produit
      prisma.approvisionnement.deleteMany({ where: { produitId: id } }),
      
      // Étape 2 : On supprime enfin le produit de la base de données
      prisma.produit.delete({ where: { id } })
    ]);

    return { success: true, message: "Le produit et tout son historique ont été effacés." };

  } catch (error) {
    console.error("Erreur lors de la suppression en cascade :", error);
    return { success: false, error: "Erreur technique lors de la suppression sur le cloud Neon." };
  }
}

