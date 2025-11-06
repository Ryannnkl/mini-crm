"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { companies } from "@/db/schema";

import { deleteCompany } from "@/app/actions/company";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Company = typeof companies.$inferSelect;

interface CompanyDetailsModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  company: Company | null;
  onDelete: (companyId: number) => void;
}

export function CompanyDetailsModal({
  isOpen,
  onOpenChange,
  company,
  onDelete,
}: CompanyDetailsModalProps) {
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  if (!company) {
    return null;
  }

  async function handleDelete() {
    setIsPending(true);
    const result = await deleteCompany(company!.id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(result.success);
      onDelete(company!.id);
    }
    setIsPending(false);
    setIsAlertOpen(false);
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{company.name}</DialogTitle>
          </DialogHeader>

          {/* Futuros detalhes da empresa podem ir aqui */}

          <DialogFooter className="mt-4">
            <Button
              variant="destructive"
              onClick={() => setIsAlertOpen(true)}
              disabled={isPending}
            >
              Delete Company
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              company.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isPending}>
              {isPending ? "Deleting..." : "Continue"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
