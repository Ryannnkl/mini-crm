"use server";

import { db } from "@/db";
import { companies, session as sessionTable } from "@/db/schema";
import {
  CreateCompanySchema,
  type CreateCompanySchemaType,
} from "@/lib/schemas/company.schema";
import { cookies } from "next/headers";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createCompany(data: CreateCompanySchemaType) {
  const validationResult = CreateCompanySchema.safeParse(data);

  if (!validationResult.success) {
    return { error: "Invalid data provided." };
  }

  const { name } = validationResult.data;

  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session_token")?.value;

    if (!sessionToken) {
      return { error: "Unauthorized: No session token." };
    }

    const [session] = await db
      .select({ userId: sessionTable.userId })
      .from(sessionTable)
      .where(eq(sessionTable.token, sessionToken));

    if (!session) {
      return { error: "Unauthorized: Invalid session." };
    }

    const [newCompany] = await db
      .insert(companies)
      .values({
        name: name,
        userId: session.userId,
      })
      .returning();

    revalidatePath("/");
    return { success: "Company created successfully!", company: newCompany };
  } catch (e) {
    console.error("Create company error:", e);
    return { error: "An unexpected error occurred." };
  }
}

export async function updateCompanyStatus(
  companyId: number,
  newStatus: "lead" | "negotiating" | "won" | "lost"
) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session_token")?.value;

    if (!sessionToken) {
      return { error: "Unauthorized" };
    }

    const [session] = await db
      .select({ userId: sessionTable.userId })
      .from(sessionTable)
      .where(eq(sessionTable.token, sessionToken));

    if (!session) {
      return { error: "Unauthorized" };
    }

    await db
      .update(companies)
      .set({ status: newStatus })
      .where(
        and(eq(companies.id, companyId), eq(companies.userId, session.userId))
      );

    revalidatePath("/");
    return { success: true };
  } catch (e) {
    console.error("Update company status error:", e);
    return { error: "An unexpected error occurred." };
  }
}

export async function deleteCompany(companyId: number) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session_token")?.value;

    if (!sessionToken) {
      return { error: "Unauthorized" };
    }

    const [session] = await db
      .select({ userId: sessionTable.userId })
      .from(sessionTable)
      .where(eq(sessionTable.token, sessionToken));

    if (!session) {
      return { error: "Unauthorized" };
    }

    const [deletedCompany] = await db
      .delete(companies)
      .where(
        and(eq(companies.id, companyId), eq(companies.userId, session.userId))
      )
      .returning({ id: companies.id });

    if (!deletedCompany) {
      return {
        error: "Company not found or permission denied.",
      };
    }

    revalidatePath("/");
    return { success: "Company deleted successfully!" };
  } catch (e) {
    console.error("Delete company error:", e);
    return { error: "An unexpected error occurred." };
  }
}