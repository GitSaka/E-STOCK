-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CHEF', 'AGENT', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "StatutVersement" AS ENUM ('EN_ATTENTE', 'VALIDE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "motDePasse" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'AGENT',
    "zone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "telephone" TEXT,
    "zone" TEXT NOT NULL,
    "soldeDette" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Produit" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "quantiteStock" INTEGER NOT NULL DEFAULT 0,
    "prixUnitaire" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Produit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Approvisionnement" (
    "id" TEXT NOT NULL,
    "quantite" INTEGER NOT NULL,
    "dateAchat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "produitId" TEXT NOT NULL,

    CONSTRAINT "Approvisionnement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VenteCredit" (
    "id" TEXT NOT NULL,
    "montantTotal" DECIMAL(12,2) NOT NULL,
    "dateVente" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clienteId" TEXT NOT NULL,
    "chefId" TEXT NOT NULL,

    CONSTRAINT "VenteCredit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LigneVenteCredit" (
    "id" TEXT NOT NULL,
    "quantite" INTEGER NOT NULL,
    "prixApplique" DECIMAL(12,2) NOT NULL,
    "venteCreditId" TEXT NOT NULL,
    "produitId" TEXT NOT NULL,

    CONSTRAINT "LigneVenteCredit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FluxVersement" (
    "id" TEXT NOT NULL,
    "montantVerse" DECIMAL(12,2) NOT NULL,
    "statut" "StatutVersement" NOT NULL DEFAULT 'EN_ATTENTE',
    "dateCollecte" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateValidation" TIMESTAMP(3),
    "clienteId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "chefId" TEXT,

    CONSTRAINT "FluxVersement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_telephone_key" ON "User"("telephone");

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_telephone_key" ON "Cliente"("telephone");

-- CreateIndex
CREATE UNIQUE INDEX "Produit_nom_key" ON "Produit"("nom");

-- AddForeignKey
ALTER TABLE "Approvisionnement" ADD CONSTRAINT "Approvisionnement_produitId_fkey" FOREIGN KEY ("produitId") REFERENCES "Produit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenteCredit" ADD CONSTRAINT "VenteCredit_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenteCredit" ADD CONSTRAINT "VenteCredit_chefId_fkey" FOREIGN KEY ("chefId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LigneVenteCredit" ADD CONSTRAINT "LigneVenteCredit_venteCreditId_fkey" FOREIGN KEY ("venteCreditId") REFERENCES "VenteCredit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LigneVenteCredit" ADD CONSTRAINT "LigneVenteCredit_produitId_fkey" FOREIGN KEY ("produitId") REFERENCES "Produit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FluxVersement" ADD CONSTRAINT "FluxVersement_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FluxVersement" ADD CONSTRAINT "FluxVersement_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FluxVersement" ADD CONSTRAINT "FluxVersement_chefId_fkey" FOREIGN KEY ("chefId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
