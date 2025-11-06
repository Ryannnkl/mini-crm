"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { companies } from "@/db/schema";

import {
  CreateCompanySchema,
  type CreateCompanySchemaType,
} from "@/lib/schemas/company.schema";
import { createCompany } from "@/app/actions/company";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface CreateCompanyModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onCompanyCreated: (newCompany: typeof companies.$inferSelect) => void;
}

export function CreateCompanyModal({
  isOpen,
  onOpenChange,
  onCompanyCreated,
}: CreateCompanyModalProps) {
  const form = useForm<CreateCompanySchemaType>({
    resolver: zodResolver(CreateCompanySchema),
    defaultValues: {
      name: "",
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: CreateCompanySchemaType) {
    const result = await createCompany(values);

    if (result.error || !result.company) {
      toast.error(result.error || "An unexpected error occurred.");
    } else {
      toast.success(result.success);
      onCompanyCreated(result.company);
      form.reset();
      onOpenChange(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new company</DialogTitle>
          <DialogDescription>
            Add a new company to your CRM to start tracking interactions.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Acme Inc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create company"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
