"use server";

import { db } from "@/db";
import { companies } from "@/db/schema";
import {
  CreateCompanySchema,
  type CreateCompanySchemaType,
} from "@/lib/schemas/company.schema";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getUserData } from "./user";

export async function createCompany(data: CreateCompanySchemaType) {
  const validationResult = CreateCompanySchema.safeParse(data);

  if (!validationResult.success) {
    return { error: "Invalid data provided." };
  }

  const { name } = validationResult.data;

  try {
    const user = await getUserData();
    if (!user) {
      return { error: "Unauthorized" };
    }

    const [newCompany] = await db
      .insert(companies)
      .values({
        name: name,
        userId: user.id,
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
    const user = await getUserData();
    if (!user) {
      return { error: "Unauthorized" };
    }
    await db
      .update(companies)
      .set({ status: newStatus })
      .where(and(eq(companies.id, companyId), eq(companies.userId, user.id)));

    revalidatePath("/");
    return { success: true };
  } catch (e) {
    console.error("Update company status error:", e);
    return { error: "An unexpected error occurred." };
  }
}

export async function deleteCompany(companyId: number) {
  try {
    const user = await getUserData();

    if (!user) {
      return { error: "Unauthorized" };
    }

    const [deletedCompany] = await db
      .delete(companies)
      .where(and(eq(companies.id, companyId), eq(companies.userId, user.id)))
      .returning({ id: companies.id });

    if (!deletedCompany) {
      return { error: "Company not found or permission denied." };
    }

    revalidatePath("/");
    return { success: "Company deleted successfully!" };
  } catch (e) {
    console.error("Delete company error:", e);
    return { error: "An unexpected error occurred." };
  }
}
