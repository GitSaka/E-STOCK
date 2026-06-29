import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardClient from "./DashboardClient";
import { Decimal } from "@prisma/client/runtime/library";

export default async function MobileDashboardPage() {
  // 1. Récupération du cookie de session
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session_gestion_stock");

  if (!sessionCookie) {
    redirect("/login");
  }

  // 2. Extraction des données de l'agent connecté
  const session = JSON.parse(sessionCookie.value);
  const agentId = session.id;

  // 3. Récupération de l'agent avec son identité et ses marchés réels (Neon)
  const agentReal = await prisma.user.findUnique({
    where: { id: agentId },
    include: {
      zones: {
        select: { id: true, nom: true }
      }
    }
  });

  if (!agentReal) {
    redirect("/login");
  }

  const nomCompletAgent = `${agentReal.prenom} ${agentReal.nom}`;
  
  // Tableau de tous les IDs des marchés gérés par cet agent
  const listeZoneIds = agentReal.zones.map((z) => z.id);
  // Chaîne de caractères pour l'en-tête mobile (ex: "Ouando, Tokpota")
  const nomZoneAffichage = agentReal.zones.map((z) => z.nom).join(", ") || "Aucune zone";

  // 4. Récupération des fiches de toutes les mamans affectées aux zones de l'agent
  const clientesReal = await prisma.cliente.findMany({
    where: {
      zoneId: {
        in: listeZoneIds
      }
    },
    orderBy: { nom: "asc" },
    select: {
      id: true,
      nom: true,
      telephone: true,
      soldeDette: true,
    }
  });

  // 5. Calcul de sa caisse "En attente" du jour (Somme de ses collectes non validées)
  const collectesDuJour = await prisma.fluxVersement.aggregate({
    where: {
      agentId: agentId,
      statut: "EN_ATTENTE"
    },
    _sum: {
      montantVerse: true
    }
  });

  const totalCaisseEnAttente = collectesDuJour._sum.montantVerse 
    ? Number(collectesDuJour._sum.montantVerse) 
    : 0;

  // 6. Typage strict sans aucun 'any' pour la boucle de formatage
  interface ClienteQueryType {
    id: string;
    nom: string;
    prenom: string;
    telephone: string | null;
    soldeDette: Decimal; // 🟢 Remplacé par le type officiel de Prisma
  }

  const clientesFormatees = (clientesReal as unknown as ClienteQueryType[]).map((c: ClienteQueryType) => ({
    id: c.id,
    nom: c.nom,
    prenom: c.prenom,
    telephone: c.telephone,
    soldeDette: Number(c.soldeDette)
  }));

  return (
    <DashboardClient 
      agentName={nomCompletAgent}
      zoneName={nomZoneAffichage}
      caisseEnAttente={totalCaisseEnAttente}
      initialClientes={clientesFormatees}
    />
  );
}
