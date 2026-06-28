import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CollectesClient from "./CollectesClient";
import { Decimal } from "@prisma/client/runtime/library";

export default async function CollectesPage() {
  // 1. Récupération de la session cookie sécurisée
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session_gestion_stock");

  if (!sessionCookie) {
    redirect("/login");
  }

  // 2. Extraction des données de l'agent connecté
  const session = JSON.parse(sessionCookie.value);
  const agentId = session.id;

  // 3. Récupération des marchés (zones) rattachés à cet agent
  const agentReal = await prisma.user.findUnique({
    where: { id: agentId },
    select: {
      zones: {
        select: { id: true }
      }
    }
  });

  if (!agentReal) {
    redirect("/login");
  }

  // Extraction de la liste des IDs des zones gérées par cet agent
  const listeZoneIds = agentReal.zones.map((z) => z.id);

  // 4. CORRECTION CHIRURGICALE : Récupération des clientes de ses zones via zoneId
  const clientesReal = await prisma.cliente.findMany({
    where: {
      zoneId: {
        in: listeZoneIds // Utilise le filtre SQL IN conforme à la relation
      }
    },
    orderBy: { nom: "asc" },
    select: {
      id: true,
      nom: true,
      prenom: true,
      telephone: true,
      soldeDette: true,
    },
  });

  // 5. Interface TypeScript locale stricte (Plus aucun any)
  interface ClienteQueryType {
    id: string;
    nom: string;
    prenom:string;
    telephone: string | null;
    soldeDette: Decimal; // Type officiel de Prisma
  }

  // 6. Conversion comptable exacte des Decimals en Numbers pour React
  const clientesFormatees = (clientesReal as unknown as ClienteQueryType[]).map((c: ClienteQueryType) => ({
    id: c.id,
    nom: c.nom,
    prenom: c.prenom,
    telephone: c.telephone,
    soldeDette: Number(c.soldeDette),
  }));

  // On envoie proprement les vraies mamas filtrées au composant client
  return <CollectesClient listeClientes={clientesFormatees} />;
}
