import { prisma } from "@/lib/prisma";
import ProduitsClient from "./ProduitsClient";
import { Decimal } from "@prisma/client/runtime/library";

export const dynamic = "force-dynamic";

export default async function ProduitsPage() {
  // 1. Extraction de tous les produits ET de leurs arrivages depuis Neon
  const produitsReal = await prisma.produit.findMany({
    include: {
      approvisionnements: {
        orderBy: { dateAchat: "desc" } // Les arrivages du produit triés par date
      }
    },
    orderBy: { 
      updatedAt: "desc" 
    }
  });

  // 2. Interfaces de typage strict pour le linter
  interface ApprovisionnementRow {
    id: string;
    quantite: number;
    dateAchat: Date;
  }

  interface ProduitPrismaRow {
    id: string;
    nom: string;
    quantiteStock: number;
    prixUnitaire: Decimal;
    approvisionnements: ApprovisionnementRow[];
  }

  // 3. Formatage propre (Conversion des Decimals et des dates lisibles)
  const produitsFormates = (produitsReal as unknown as ProduitPrismaRow[]).map((p: ProduitPrismaRow) => ({
    id: p.id,
    nom: p.nom,
    quantiteStock: p.quantiteStock,
    prixUnitaire: Number(p.prixUnitaire),
    arrivages: p.approvisionnements.map(a => ({
      id: a.id,
      quantite: a.quantite,
      date: a.dateAchat.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    }))
  }));

  return <ProduitsClient initialProduits={produitsFormates} />;
}
