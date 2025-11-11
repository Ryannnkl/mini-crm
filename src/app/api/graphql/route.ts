import { createYoga } from "graphql-yoga";
import { createSchema } from "graphql-yoga";
import { typeDefs } from "@/lib/graphql/schemas";
import { resolvers, type GraphQLContext } from "@/lib/graphql/resolvers";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { eq, and, gte } from "drizzle-orm";
import { session as sessionTable, user as userTable } from "@/db/schema";

const schema = createSchema({
  typeDefs,
  resolvers,
});

const { handleRequest } = createYoga<GraphQLContext>({
  schema,
  graphqlEndpoint: "/api/graphql",
  fetchAPI: { Response: NextResponse },
  context: async ({ request }): Promise<GraphQLContext> => {
    try {
      const cookies = request.headers.get("Cookie") || "";
      const sessionToken = cookies?.split("session_token=")[1];

      if (!sessionToken) {
        return { user: null };
      }

      const [session] = await db
        .select({
          user: {
            id: userTable.id,
            name: userTable.name,
            email: userTable.email,
            emailVerified: userTable.emailVerified,
            image: userTable.image,
            createdAt: userTable.createdAt,
            updatedAt: userTable.updatedAt,
          },
          expiresAt: sessionTable.expiresAt,
        })
        .from(sessionTable)
        .innerJoin(userTable, eq(sessionTable.userId, userTable.id))
        .where(
          and(
            eq(sessionTable.token, sessionToken),
            gte(sessionTable.expiresAt, new Date())
          )
        )
        .limit(1);

      if (!session || !session.user) {
        return { user: null };
      }

      return { user: session.user };
    } catch (error) {
      console.error("Error validating session:", error);
      return { user: null };
    }
  },
});

export { handleRequest as GET, handleRequest as POST };
