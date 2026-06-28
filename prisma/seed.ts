import { PrismaClient, Role, StatutVersement } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('⏳ Début du peuplement de la base de données (Seed)...');

   // 1. NETTOYAGE PRÉALABLE (Ordre strict des clés étrangères)
  await prisma.fluxVersement.deleteMany({});
  await prisma.ligneVenteCredit.deleteMany({});
  await prisma.venteCredit.deleteMany({});
  await prisma.cliente.deleteMany({});
  await prisma.approvisionnement.deleteMany({}); // Nettoie les entrées de stock
  await prisma.produit.deleteMany({});
  await prisma.user.deleteMany({});


  // 2. CRÉATION DES UTILISATEURS (Chefs et Agents)
  const motDePasseHache = await bcrypt.hash('PortoNovo2026', 10);

  // Un Chef principal (Admin)
  const chefAlfred = await prisma.user.create({
    data: {
      nom: 'AGBOSSA',
      prenom: 'Alfred',
      telephone: '22997000001',
      motDePasse: motDePasseHache,
      role: Role.CHEF,
    },
  });

  // Un Agent pour la zone Marché Ouando
  const agentMarc = await prisma.user.create({
    data: {
      nom: 'HOUNSOU',
      prenom: 'Marc',
      telephone: '22997000002',
      motDePasse: motDePasseHache,
      role: Role.AGENT,
      zone: 'Ouando',
    },
  });

  // Un Agent pour la zone Tokpota
  const agentIdriss = await prisma.user.create({
    data: {
      nom: 'SOULE',
      prenom: 'Idriss',
      telephone: '22997000003',
      motDePasse: motDePasseHache,
      role: Role.AGENT,
      zone: 'Tokpota',
    },
  });

  console.log('✅ Utilisateurs créés (1 Chef, 2 Agents).');

  // 3. CRÉATION DES PRODUITS DE L'INVENTAIRE INITIAL
  const riz = await prisma.produit.create({
    data: {
      nom: 'Sac de Riz 50kg',
      quantiteStock: 150,
      prixUnitaire: 25000.00, // 25 000 FCFA
    },
  });

  const mais = await prisma.produit.create({
    data: {
      nom: 'Sac de Maïs 100kg',
      quantiteStock: 80,
      prixUnitaire: 18000.00, // 18 000 FCFA
    },
  });

  const huile = await prisma.produit.create({
    data: {
      nom: "Bidon d'Huile 25L",
      quantiteStock: 45,
      prixUnitaire: 22000.00, // 22 000 FCFA
    },
  });

  console.log('✅ Catalogue produits initialisé avec stocks.');

  // 4. CRÉATION DES CLIENTES (Les Bonnes Dames)
  // Maman Chantal commence avec une dette existante de 30 000 FCFA
  const mamanChantal = await prisma.cliente.create({
    data: {
      nom: 'Maman Chantal',
      telephone: '22995000001',
      zone: 'Ouando',
      soldeDette: 30000.00,
    },
  });

  // Tantie Ablawa commence à 0 FCFA (Pas de dette)
  const tantieAblawa = await prisma.cliente.create({
    data: {
      nom: 'Tantie Ablawa',
      telephone: '22995000002',
      zone: 'Ouando',
      soldeDette: 0.00,
    },
  });

  // Maman Sika commence avec une avance / surplus de 5 000 FCFA (-5000)
  const mamanSika = await prisma.cliente.create({
    data: {
      nom: 'Maman Sika',
      telephone: '22995000003',
      zone: 'Tokpota',
      soldeDette: -5000.00,
    },
  });

  console.log('✅ Fiches clientes créées avec soldes initiaux.');

  // 5. SIMULATION D'UN FLUX DE VERSEMENT DU TERRAIN (Règle Anti-fraude)
  // L'agent Marc saisit un versement de 15 000 FCFA de Maman Chantal sur le terrain
  await prisma.fluxVersement.create({
    data: {
      montantVerse: 15000.00,
      statut: StatutVersement.EN_ATTENTE, // Reste bloqué tant que le chef ne valide pas
      clienteId: mamanChantal.id,
      agentId: agentMarc.id,
    },
  });

  console.log('✅ Simulation de flux terrain injectée (En attente).');
  console.log('🎉 Seed terminé avec succès ! Base de données prête pour les tests.');
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
