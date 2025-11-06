import * as z from "zod";

export const CreateCompanySchema = z.object({
  name: z.string().min(1, { message: "Company name is required." }),
});

export type CreateCompanySchemaType = z.infer<typeof CreateCompanySchema>;
