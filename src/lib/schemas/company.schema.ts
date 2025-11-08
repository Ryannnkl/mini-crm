"use client";

import * as z from "zod";

export const CreateCompanySchema = z.object({
  name: z.string().min(2, "Name is required"),
});

export const CompanyFormSchema = z.object({
  name: z.string().min(2, "Name is required"),
  website: z
    .url("Must be a valid URL")
    .or(z.literal("").transform(() => null))
    .nullable()
    .optional(),
  phone: z
    .string()
    .regex(/^[0-9()+\-\s]*$/, "Invalid phone number")
    .optional()
    .nullable(),
  primaryContactName: z.string().optional().nullable(),
  primaryContactEmail: z.string().optional().nullable(),
  potentialValue: z
    .number({ message: "Must be a number" })
    .nonnegative("Value cannot be negative"),
  leadSource: z.enum(["website", "referral", "cold_call", "other"]),
});

export type CreateCompanySchemaType = z.infer<typeof CreateCompanySchema>;
export type CompanyFormValues = z.infer<typeof CompanyFormSchema>;
