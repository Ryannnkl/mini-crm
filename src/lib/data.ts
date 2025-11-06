import { db } from "@/db";
import { companies, session as sessionTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getCompaniesForUser(sessionToken: string) {
  const [session] = await db
    .select({ userId: sessionTable.userId })
    .from(sessionTable)
    .where(eq(sessionTable.token, sessionToken));

  if (!session) {
    return [];
  }

  const userCompanies = await db
    .select()
    .from(companies)
    .where(eq(companies.userId, session.userId));

  return userCompanies;
}
