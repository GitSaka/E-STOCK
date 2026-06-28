import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import HistoriqueClient from "./HistoriqueClient";

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

  // Extraction des collectes réelles sur Neon
  const collectesReal = await prisma.fluxVersement.findMany({
    where: {
      agentId: agentId,
      dateCollecte: { gte: debutJournee, lte: finJournee },
    },
    orderBy: { dateCollecte: "desc" },
    include: {
      cliente: {
        select: { nom: true, zone: true, soldeDette: true }
      }
    }
  });

  interface PrismaHistoryRow {
    id: string;
    montantVerse: any;
    statut: "EN_ATTENTE" | "VALIDE";
    dateCollecte: Date;
    cliente: { nom: string; zone: string; soldeDette: any };
  }

  const historiqueFormate = collectesReal.map((c: PrismaHistoryRow) => ({
    id: c.id.substring(0, 5).toUpperCase(), // Raccourcit l'ID cuid pour l'affichage
    mamanNom: c.cliente.nom,
    zone: c.cliente.zone,
    montant: Number(c.montantVerse),
    resteAPayer: Number(c.cliente.soldeDette),
    statut: c.statut,
    heure: c.dateCollecte.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  }));

  return <HistoriqueClient listeHistorique={historiqueFormate} />;
}
