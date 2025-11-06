"use server";

import { db } from "@/db";
import { interactions, session as sessionTable, companies } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function getInteractions(companyId: number) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session_token")?.value;
    if (!sessionToken) return { error: "Unauthorized" };

    const [session] = await db
      .select({ userId: sessionTable.userId })
      .from(sessionTable)
      .where(eq(sessionTable.token, sessionToken));
    if (!session) return { error: "Unauthorized" };

    const [company] = await db
      .select({ id: companies.id })
      .from(companies)
      .where(and(eq(companies.id, companyId), eq(companies.userId, session.userId)));

    if (!company) {
      return { error: "Company not found or permission denied." };
    }

    const companyInteractions = await db
      .select()
      .from(interactions)
      .where(eq(interactions.companyId, companyId))
      .orderBy(desc(interactions.createdAt));

    return { interactions: companyInteractions };
  } catch (e) {
    console.error("Get interactions error:", e);
    return { error: "An unexpected error occurred." };
  }
}

export async function createInteraction(companyId: number, content: string) {
  if (!content.trim()) {
    return { error: "Interaction content cannot be empty." };
  }

  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session_token")?.value;
    if (!sessionToken) return { error: "Unauthorized" };

    const [session] = await db
      .select({ userId: sessionTable.userId })
      .from(sessionTable)
      .where(eq(sessionTable.token, sessionToken));
    if (!session) return { error: "Unauthorized" };

    const [company] = await db
      .select({ id: companies.id })
      .from(companies)
      .where(and(eq(companies.id, companyId), eq(companies.userId, session.userId)));

    if (!company) {
      return { error: "Company not found or permission denied." };
    }

    const [newInteraction] = await db
      .insert(interactions)
      .values({ companyId, content })
      .returning();

    revalidatePath("/");
    return { success: "Interaction added!", interaction: newInteraction };
  } catch (e) {
    console.error("Create interaction error:", e);
    return { error: "An unexpected error occurred." };
  }
}
