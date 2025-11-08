"use server";

import { auth } from "@/lib/auth";
import type { User } from "better-auth";
import { headers } from "next/headers";

export async function getUserData(): Promise<User> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  return session.user;
}
