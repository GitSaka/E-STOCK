import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import HistoriqueClient from "./HistoriqueClient";
import { Decimal } from "@prisma/client/runtime/library";

export default async function HistoriquePage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session_gestion_stock");

  if (!sessionCookie) {
    redirect("/login");
  }

  const session = JSON.parse(sessionCookie.value);
  const agentId = session.id;

  const debutJournee = new Date();
  debutJournee.setHours(0, 0, 0, 0);

  const finJournee = new Date();
  finJournee.setHours(23, 59, 59, 999);

  // Extraction des collectes réelles sur Neon avec la relation de zone
  const collectesReal = await prisma.fluxVersement.findMany({
    where: {
      agentId: agentId,
      dateCollecte: { gte: debutJournee, lte: finJournee },
    },
    orderBy: { dateCollecte: "desc" },
    include: {
      cliente: {
        select: { 
          nom: true, 
          soldeDette: true,
          zone: {
            select: { nom: true } // 🟢 Charge le nom du marché via la relation
          }
        }
      }
    }
  });

  // Interface stricte sans aucun 'any' pour le compilateur
  interface PrismaHistoryRow {
    id: string;
    montantVerse: Decimal;
    statut: "EN_ATTENTE" | "VALIDE";
    dateCollecte: Date;
    cliente: { 
      nom: string; 
      soldeDette: Decimal;
      zone: { nom: string }; // 🟢 L'objet relationnel typé proprement
    };
  }

  // Conversion et formatage pour l'affichage
  const historiqueFormate = (collectesReal as unknown as PrismaHistoryRow[]).map((c: PrismaHistoryRow) => ({
    id: c.id.substring(0, 5).toUpperCase(), 
    mamanNom: c.cliente.nom,
    zone: c.cliente.zone.nom, // 🟢 Récupère le texte depuis l'objet relationnel
    montant: Number(c.montantVerse),
    resteAPayer: Number(c.cliente.soldeDette),
    statut: c.statut,
    heure: c.dateCollecte.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  }));

  // Renvoie exactement ton composant initial sans casser tes props
  return <HistoriqueClient listeHistorique={historiqueFormate} />;
}
