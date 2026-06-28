import { PrismaClient } from '@prisma/client';

// Cette ligne permet d'éviter la multiplication des connexions à Neon en mode développement
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// On réutilise l'instance existante si elle est dans l'objet global, sinon on en crée une nouvelle
export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
