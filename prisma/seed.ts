import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("⏳ Début du nettoyage et de la réinitialisation de la base Neon...");

  // 1. Suppression ordonnée pour éviter les conflits de clés étrangères
  await prisma.fluxVersement.deleteMany();
  await prisma.approvisionnement.deleteMany();
  await prisma.ligneVenteCredit.deleteMany();
  await prisma.venteCredit.deleteMany();
  await prisma.cliente.deleteMany();
  await prisma.produit.deleteMany();
  
  // Nettoyage de la relation Many-to-Many des utilisateurs avant suppression
  await prisma.user.updateMany({ data: {} });
  await prisma.user.deleteMany();
  await prisma.zone.deleteMany();

  console.log("✅ Base de données nettoyée avec succès.");

  // 2. CRÉATION DES VRAIS SECTEURS (MARCHÉS DE PORTO-NOVO)
  const zoneOuando = await prisma.zone.create({
    data: { nom: "Ouando", adresse: "Grand marché Ouando, Porto-Novo" }
  });

  const zoneTokpota = await prisma.zone.create({
    data: { nom: "Tokpota", adresse: "Marché secondaire de Tokpota" }
  });

  console.log("✅ Secteurs Ouando et Tokpota insérés.");

  // Hachage sécurisé standard des mots de passe de test
  const passHache = await bcrypt.hash("123456", 10);

  // 3. CRÉATION DES COMPTES SÉCURISÉS (CHEF ET COLLECTEURS MULTI-ZONES)
  await prisma.user.create({
    data: {
      nom: "ALFRED",
      prenom: "Chef",
      telephone: "99000000",
      motDePasse: passHache,
      role: "CHEF"
    }
  });

  // Agent Marc gère uniquement le marché de Ouando
  await prisma.user.create({
    data: {
      nom: "KOFFI",
      prenom: "Marc",
      telephone: "97000000",
      motDePasse: passHache,
      role: "AGENT",
      zones: {
        connect: [{ id: zoneOuando.id }]
      }
    }
  });

  // Agent Koffi gère le marché de Tokpota
  await prisma.user.create({
    data: {
      nom: "AGBOSSA",
      prenom: "Koffi",
      telephone: "96000000",
      motDePasse: passHache,
      role: "AGENT",
      zones: {
        connect: [{ id: zoneTokpota.id }]
      }
    }
  });

  console.log("✅ Personnel d'administration et collecteurs de terrain créés.");

  // 4. CRÉATION DU CATALOGUE DE MARCHANDISES INITIAL
  const produitRiz = await prisma.produit.create({
    data: { nom: "Sac de Riz 50kg", prixUnitaire: 18500, quantiteStock: 50 }
  });

  const produitMais = await prisma.produit.create({
    data: { nom: "Sac de Maïs 50kg", prixUnitaire: 12000, quantiteStock: 120 }
  });

  console.log("✅ Catalogue marchandises initialisé.");

  // 5. CRÉATION DES REVENDEUSES (BONNES DAMES) BRANCHÉES AUX ID DES MARCHÉS
  await prisma.cliente.create({
    data: {
      nom: "CHANTAL",
      prenom: "Maman",
      telephone: "95000001",
      adresse: "Allée Centrale, Étal 14",
      zoneId: zoneOuando.id, // Liée physiquement à l'ID de Ouando
      soldeDette: 45000
    }
  });

  await prisma.cliente.create({
    data: {
      nom: "ABLAWA",
      prenom: "Tantie",
      telephone: "95000002",
      adresse: "Face à la Loterie",
      zoneId: zoneOuando.id,
      soldeDette: 15000
    }
  });

  await prisma.cliente.create({
    data: {
      nom: "VIWAMI",
      prenom: "Maman",
      telephone: "95000003",
      adresse: "Près du grand hangar",
      zoneId: zoneTokpota.id, // Liée physiquement à l'ID de Tokpota
      soldeDette: 0
    }
  });

  console.log("🌱 Population de fausses données de test injectée à 100 % !");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
