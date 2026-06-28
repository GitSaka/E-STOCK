"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// 1. CRÉATION D'UNE NOUVELLE ZONE (MARCHÉ)
export async function creerZoneAction(nom: string, adresse?: string, id?: string | null) {
  if (!nom.trim()) return { success: false, error: "Le nom de la zone est obligatoire." };

  try {
    // 1. En mode Modification (si un ID est fourni)
    if (id) {
      // Sécurité : Vérifie si le nouveau nom n'est pas déjà pris par UN AUTRE marché
      const nomPris = await prisma.zone.findFirst({
        where: {
          nom: nom.trim(),
          NOT: { id: id }
        }
      });
      if (nomPris) return { success: false, error: "Ce nom de marché est déjà utilisé pour un autre secteur." };

      // Mise à jour de la ligne Neon ciblée
      await prisma.zone.update({
        where: { id: id },
        data: { nom: nom.trim(), adresse: adresse || null }
      });

      return { success: true, message: "Le secteur a été mis à jour avec succès !" };
    }

    // 2. En mode Création classique (si aucun ID n'est fourni)
    const zoneExiste = await prisma.zone.findUnique({ where: { nom: nom.trim() } });
    if (zoneExiste) return { success: false, error: "Ce secteur existe déjà." };

    await prisma.zone.create({
      data: { nom: nom.trim(), adresse: adresse }
    });

    return { success: true, message: "Le nouveau secteur a été configuré." };

  } catch (error) {
    console.error(error);
    return { success: false, error: "Erreur lors de l'enregistrement sur le serveur cloud Neon." };
  }
}

export async function creerClienteAction(data: {
  id?: string | null; // L'ID devient optionnel pour intercepter la modification
  nom: string;
  prenom?: string;
  telephone?: string;
  adresse?: string;
  zoneId: string;
  soldeDette: number;
}) {
  if (!data.nom || !data.zoneId) {
    return { success: false, error: "Le nom et la zone d'affectation sont obligatoires." };
  }

  try {
    // Nettoyage et formatage des entrées texte de base
    const nomNettoye = data.nom.trim();
    const prenomNettoye = data.prenom?.trim() || null;
    const telNettoye = data.telephone?.trim() || null;
    const adresseNettoye = data.adresse?.trim() || null;

    // -------------------------------------------------------------------------
    // CAS 1 : MODE MODIFICATION (Un ID est fourni)
    // -------------------------------------------------------------------------
    if (data.id) {
      // Sécurité : On vérifie si le nouveau numéro n'est pas déjà pris par une AUTRE maman
      if (telNettoye) {
        const telPris = await prisma.cliente.findFirst({
          where: {
            telephone: telNettoye,
            NOT: { id: data.id }
          }
        });
        if (telPris) return { success: false, error: "Ce numéro de téléphone appartient déjà à une autre revendeuse." };
      }

      // Mise à jour de la fiche sur Neon (On bloque la modification du solde initial en mode correction pour la sécurité comptable)
      await prisma.cliente.update({
        where: { id: data.id },
        data: {
          nom: nomNettoye,
          prenom: prenomNettoye,
          telephone: telNettoye,
          adresse: adresseNettoye,
          zoneId: data.zoneId
        }
      });

      return { success: true, message: "La fiche de la revendeuse a été mise à jour avec succès !" };
    }

    // -------------------------------------------------------------------------
    // CAS 2 : MODE CRÉATION CLASSIQUE (Aucun ID fourni)
    // -------------------------------------------------------------------------
    if (telNettoye) {
      const clienteExiste = await prisma.cliente.findUnique({
        where: { telephone: telNettoye }
      });
      if (clienteExiste) return { success: false, error: "Une revendeuse possède déjà ce numéro de téléphone." };
    }

    // Création d'une nouvelle ligne autonome dans Neon
    await prisma.cliente.create({
      data: {
        nom: nomNettoye,
        prenom: prenomNettoye,
        telephone: telNettoye,
        adresse: adresseNettoye,
        zoneId: data.zoneId,
        soldeDette: data.soldeDette // Converti en Decimal de manière transparente
      }
    });

    return { success: true, message: "Nouvelle fiche revendeuse enregistrée avec succès !" };

  } catch (error) {
    console.error("Erreur serveur lors de la sauvegarde de la maman :", error);
    return { success: false, error: "Impossible de joindre le serveur cloud de base de données." };
  }
}

export async function creerAgentAction(data: {
  id?: string | null; // L'ID devient optionnel pour intercepter la modification
  nom: string;
  prenom: string;
  telephone: string;
  motDePasse?: string; // Optionnel en mode modification
  zoneIds: string[];
}) {
  if (!data.nom || !data.prenom || !data.telephone) {
    return { success: false, error: "Veuillez remplir tous les champs obligatoires." };
  }

  try {
    // -------------------------------------------------------------------------
    // CAS 1 : MODE MODIFICATION (Un ID est fourni)
    // -------------------------------------------------------------------------
    if (data.id) {
      // Sécurité : On vérifie que le numéro n'est pas déjà pris par un AUTRE utilisateur
      const telPris = await prisma.user.findFirst({
        where: {
          telephone: data.telephone.trim(),
          NOT: { id: data.id }
        }
      });
      if (telPris) return { success: false, error: "Ce numéro de téléphone est déjà attribué à un autre compte." };

      // Préparation de l'objet de mise à jour des données de base
      const donneesMiseAJour: any = {
        nom: data.nom.trim(),
        prenom: data.prenom.trim(),
        telephone: data.telephone.trim(),
        // L'astuce Prisma 'set' vide l'ancienne liste Many-to-Many et injecte la nouvelle grille proprement
        zones: {
          set: data.zoneIds.map(id => ({ id }))
        }
      };

      // Si le chef a tapé un nouveau mot de passe, on le hache et on l'ajoute à la mise à jour
      if (data.motDePasse && data.motDePasse.trim() !== "") {
        donneesMiseAJour.motDePasse = await bcrypt.hash(data.motDePasse.trim(), 10);
      }

      // Envoi de la mise à jour sur Neon
      await prisma.user.update({
        where: { id: data.id },
        data: donneesMiseAJour
      });

      return { success: true, message: "Le compte du collecteur a été mis à jour avec succès !" };
    }

    // -------------------------------------------------------------------------
    // CAS 2 : MODE CRÉATION CLASSIQUE (Aucun ID fourni)
    // -------------------------------------------------------------------------
    if (!data.motDePasse) return { success: false, error: "Le mot de passe est obligatoire à la création." };

    const utilisateurExiste = await prisma.user.findUnique({ 
      where: { telephone: data.telephone.trim() } 
    });
    if (utilisateurExiste) return { success: false, error: "Ce numéro de téléphone est déjà utilisé." };

    const passHache = await bcrypt.hash(data.motDePasse.trim(), 10);

    await prisma.user.create({
      data: {
        nom: data.nom.trim(),
        prenom: data.prenom.trim(),
        telephone: data.telephone.trim(),
        motDePasse: passHache,
        role: "AGENT",
        zones: {
          connect: data.zoneIds.map(id => ({ id }))
        }
      }
    });

    return { success: true, message: "Nouveau compte collecteur créé !" };

  } catch (error) {
    console.error("Erreur serveur lors de la sauvegarde de l'agent :", error);
    return { success: false, error: "Une erreur technique est survenue sur le serveur cloud." };
  }
}

// 4. RÉCUPÉRATION COMPLÈTE DES ZONES POUR ALIMENTER LES LISTES DÉROULANTES
export async function obtenirToutesLesZones() {
  try {
    return await prisma.zone.findMany({
      orderBy: { nom: "asc" },
      select: { id: true, nom: true }
    });
  } catch {
    return [];
  }
}

// 5. SUPPRESSION SÉCURISÉE D'UN SECTEUR (ZONE)
export async function supprimerZoneAction(id: string) {
  if (!id) return { success: false, error: "Identifiant invalide." };

  try {
    // Sécurité : On vérifie si des clientes sont encore rattachées à ce marché
    const countClientes = await prisma.cliente.count({ where: { zoneId: id } });
    if (countClientes > 0) {
      return { 
        success: false, 
        error: `Impossible de supprimer ce secteur. Il contient encore ${countClientes} revendeuse(s) enregistrée(s).` 
      };
    }

    // Sécurité : On vérifie si des agents couvrent encore ce marché
    const countAgents = await prisma.user.count({ where: { zones: { some: { id } } } });
    if (countAgents > 0) {
      return { 
        success: false, 
        error: "Impossible de supprimer ce secteur. Des collecteurs y sont encore affectés." 
      };
    }

    await prisma.zone.delete({ where: { id } });
    return { success: true, message: "Le secteur a été supprimé de la base." };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Erreur technique lors de la suppression." };
  }
}

// 6. SUPPRESSION D'UN COLLECTEUR (AGENT)
export async function supprimerAgentAction(id: string) {
  if (!id) return { success: false, error: "Identifiant invalide." };

  try {
    await prisma.user.delete({ where: { id } });
    return { success: true, message: "Le compte du collecteur a été supprimé." };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Impossible de supprimer ce collecteur (historique existant)." };
  }
}

// 7. SUPPRESSION D'UNE REVENDEUSE (CLIENTE)
export async function supprimerClienteAction(id: string) {
  if (!id) return { success: false, error: "Identifiant invalide." };

  try {
    // Sécurité : On bloque si elle a encore une dette ou un surplus actif
    const cliente = await prisma.cliente.findUnique({ where: { id }, select: { soldeDette: true } });
    if (cliente && Number(cliente.soldeDette) !== 0) {
      return { success: false, error: "Impossible de supprimer une revendeuse dont le solde n'est pas à 0 FCFA." };
    }

    await prisma.cliente.delete({ where: { id } });
    return { success: true, message: "La fiche de la revendeuse a été retirée." };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Suppression refusée. Cette cliente possède un historique de transactions." };
  }
}

