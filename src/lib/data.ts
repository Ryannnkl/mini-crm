import { db } from "@/db";
import { companies } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getCompaniesForUser(userId: string) {
  const userCompanies = await db
    .select()
    .from(companies)
    .where(eq(companies.userId, userId));

  return userCompanies;
}
