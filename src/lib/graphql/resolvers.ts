import { db } from "@/db";
import { companies } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { User } from "better-auth";

export interface GraphQLContext {
  user: User | null;
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
  if (!context.user) {
    throw new Error("Unauthorized");
  }
  return context.user;
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
