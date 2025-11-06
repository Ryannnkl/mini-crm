'use server';

import { cookies } from "next/headers";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { session as sessionTable, user as userTable } from "@/db/schema";
import { unstable_cache } from "next/cache";

const getCachedUser = unstable_cache(
  async (sessionToken: string) => {
    const [session] = await db
      .select({ userId: sessionTable.userId })
      .from(sessionTable)
      .where(eq(sessionTable.token, sessionToken));

    if (!session) {
      return null;
    }

    const [user] = await db
      .select({
        name: userTable.name,
        email: userTable.email,
        image: userTable.image,
      })
      .from(userTable)
      .where(eq(userTable.id, session.userId));

    return user || null;
  },
  ['user-data-by-token'],
  { revalidate: 30 }
);

export async function getUserData() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token")?.value;

  if (!sessionToken) {
    return null;
  }

  return getCachedUser(sessionToken);
}
