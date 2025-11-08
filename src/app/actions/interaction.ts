"use server";

import { db } from "@/db";
import { interactions, companies } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getUserData } from "./user";

export async function getInteractions(companyId: number) {
  try {
    const user = await getUserData();
    if (!user) return { error: "Unauthorized" };

    const [company] = await db
      .select({ id: companies.id })
      .from(companies)
      .where(and(eq(companies.id, companyId), eq(companies.userId, user.id)));

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
    const user = await getUserData();
    if (!user) return { error: "Unauthorized" };

    const [company] = await db
      .select({ id: companies.id })
      .from(companies)
      .where(and(eq(companies.id, companyId), eq(companies.userId, user.id)));
    if (!company) return { error: "Company not found or permission denied." };

    const [newInteraction] = await db
      .insert(interactions)
      .values({ companyId, content })
      .returning();

    if (!newInteraction) {
      return { error: "Interaction not created." };
    }

    revalidatePath("/");
    return { success: "Interaction added!", interaction: newInteraction };
  } catch (e) {
    console.error("Create interaction error:", e);
    return { error: "An unexpected error occurred." };
  }
}
