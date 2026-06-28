import { prisma } from "@/lib/prisma";

// 🟢 Étape A : Importation du type Decimal officiel de Prisma
import { Decimal } from "@prisma/client/runtime/library";
import ParametresClient from "./ParametresClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ParametresPage() {
  // 1. Chargement des vraies zones / marchés
  const zonesReal = await prisma.zone.findMany({
    orderBy: { nom: "asc" },
    select: { id: true, nom: true, adresse: true }
  });

  // 2. Chargement des vraies clientes (Bonnes Dames) avec leur zone associée
  const clientesReal = await prisma.cliente.findMany({
    orderBy: { nom: "asc" },
    include: { zone: { select: { nom: true } } }
  });

  // 3. Chargement des agents de terrain
  const agentsReal = await prisma.user.findMany({
    where: { role: "AGENT" },
    orderBy: { nom: "asc" },
    include: { zones: { select: { id: true, nom: true } } }
  });

  // 4. Interfaces pour le typage strict et conforme
  interface ClientePrismaRow {
    id: string;
    nom: string;
    prenom: string | null;
    telephone: string | null;
    adresse: string | null;
    zoneId: string;
    soldeDette: Decimal; // 🟢 Utilisation du vrai type au lieu de any
    zone: { nom: string };
  }

  interface AgentPrismaRow {
    id: string;
    nom: string;
    prenom: string;
    telephone: string;
    zones: { id: string; nom: string }[];
  }

  // 5. Conversion avec application des types stricts (Plus de c: any ni a: any)
  const clientesFormatees = (clientesReal as unknown as ClientePrismaRow[]).map((c: ClientePrismaRow) => ({
    id: c.id,
    nom: c.nom,
    prenom: c.prenom || "",
    telephone: c.telephone || "Pas de numéro",
    adresse: c.adresse || "Pas d'adresse",
    zoneNom: c.zone.nom,
    zoneId: c.zoneId,
    soldeDette: Number(c.soldeDette)
  }));

  const agentsFormates = (agentsReal as unknown as AgentPrismaRow[]).map((a: AgentPrismaRow) => ({
    id: a.id,
    nom: a.nom,
    prenom: a.prenom,
    telephone: a.telephone,
    zones: a.zones.map((z: { id: string; nom: string }) => z.nom)
  }));

  return (
    <ParametresClient
      initialZones={zonesReal} 
      initialClientes={clientesFormatees} 
      initialAgents={agentsFormates} 
    />
  );
}
