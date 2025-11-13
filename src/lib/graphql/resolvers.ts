import { db } from "@/db";
import { companies, interactions } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import type { User } from "better-auth";

export interface GraphQLContext {
  params: Promise<Record<string, string>>;
}

interface CreateCompanyInput {
  name: string;
  status?: "lead" | "negotiating" | "won" | "lost";
  website?: string;
  phone?: string;
  primaryContactName?: string;
  primaryContactEmail?: string;
  potentialValue?: number;
  leadSource?: "website" | "referral" | "cold_call" | "other";
}

interface UpdateCompanyInput {
  name?: string;
  status?: "lead" | "negotiating" | "won" | "lost";
  website?: string;
  phone?: string;
  primaryContactName?: string;
  primaryContactEmail?: string;
  potentialValue?: number;
  leadSource?: "website" | "referral" | "cold_call" | "other";
}

function requireAuth(context: GraphQLContext): User {
  const contexto = context as unknown as { user: User };
  if (!contexto.user) {
    throw new Error("Unauthorized");
  }
  return contexto.user;
}

export const resolvers = {
  Query: {
    companies: async (_: unknown, __: unknown, context: GraphQLContext) => {
      const user = requireAuth(context);

      const userCompanies = await db
        .select()
        .from(companies)
        .where(eq(companies.userId, user.id));

      return userCompanies;
    },

    interactions: async (
      _: unknown,
      { companyId }: { companyId: number },
      context: GraphQLContext
    ) => {
      requireAuth(context);

      const interactionsList = await db
        .select()
        .from(interactions)
        .where(eq(interactions.companyId, companyId))
        .orderBy(desc(interactions.createdAt));

      return interactionsList;
    },

    company: async (
      _: unknown,
      { id }: { id: number },
      context: GraphQLContext
    ) => {
      const user = requireAuth(context);

      const [company] = await db
        .select()
        .from(companies)
        .where(eq(companies.id, id));

      if (!company) {
        throw new Error("Company not found");
      }

      if (company.userId !== user.id) {
        throw new Error("Unauthorized");
      }

      return company;
    },
  },

  Mutation: {
    createInteraction: async (
      _: unknown,
      { companyId, content }: { companyId: number; content: string },
      context: GraphQLContext
    ) => {
      const user = requireAuth(context);

      const [company] = await db
        .select()
        .from(companies)
        .where(and(eq(companies.id, companyId), eq(companies.userId, user.id)));

      if (!company) {
        throw new Error("Company not found or access denied");
      }

      const [newInteraction] = await db
        .insert(interactions)
        .values({
          companyId,
          content,
        })
        .returning();

      return newInteraction;
    },

    createCompany: async (
      _: unknown,
      { input }: { input: CreateCompanyInput },
      context: GraphQLContext
    ) => {
      const user = requireAuth(context);

      const [newCompany] = await db
        .insert(companies)
        .values({
          ...input,
          userId: user.id,
        })
        .returning();

      return newCompany;
    },

    updateCompany: async (
      _: unknown,
      { id, input }: { id: number; input: UpdateCompanyInput },
      context: GraphQLContext
    ) => {
      const user = requireAuth(context);

      const [existingCompany] = await db
        .select()
        .from(companies)
        .where(eq(companies.id, id));

      if (!existingCompany) {
        throw new Error("Company not found");
      }

      if (existingCompany.userId !== user.id) {
        throw new Error("Unauthorized");
      }

      const [updatedCompany] = await db
        .update(companies)
        .set(input)
        .where(eq(companies.id, id))
        .returning();

      return updatedCompany;
    },

    deleteCompany: async (
      _: unknown,
      { id }: { id: number },
      context: GraphQLContext
    ) => {
      const user = requireAuth(context);

      const [existingCompany] = await db
        .select()
        .from(companies)
        .where(eq(companies.id, id));

      if (!existingCompany) {
        throw new Error("Company not found");
      }

      if (existingCompany.userId !== user.id) {
        throw new Error("Unauthorized");
      }

      await db.delete(companies).where(eq(companies.id, id));

      return true;
    },
  },
};
