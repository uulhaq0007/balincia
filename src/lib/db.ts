import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

/** Interactive transactions make several round-trips; give hosted Postgres room beyond Prisma's 5s default. */
export const TX_OPTIONS = { maxWait: 10_000, timeout: 20_000 };
