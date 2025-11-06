import { db } from "@/db";
import { eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { cookies } from "next/headers";
import { session as sessionTable, user as userTable } from "@/db/schema";

export const getUser = async () => {
  "use cache: private";
  cacheTag(`user-data`);
  cacheLife({ stale: 60 });

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token")?.value;

  if (!sessionToken) {
    return null;
  }

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
};
