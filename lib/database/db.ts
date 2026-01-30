import { PrismaClient } from "@/prisma/generated/client";
import { PrismaNeon } from "@prisma/adapter-neon";
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
export const db = new PrismaClient({ adapter });
// use `prisma` to read/write data
