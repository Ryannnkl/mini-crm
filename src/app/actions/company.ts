"use server";

import { db } from "@/db";
import { companies, session as sessionTable } from "@/db/schema";
import {
  CreateCompanySchema,
  type CreateCompanySchemaType,
} from "@/lib/schemas/company.schema";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
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

    await db.insert(companies).values({
      name: name,
      userId: session.userId,
    });

    revalidatePath("/");
    return { success: "Company created successfully!" };
  } catch (e) {
    console.error("Create company error:", e);
    return { error: "An unexpected error occurred." };
  }
}
