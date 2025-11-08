"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InteractionsTab } from "./section/interactions-tab";
import { HeaderActions } from "./section/header-actions";
import { DetailsTab } from "./section/details-tab";
import { useCompanyDetailsModal } from "./hook/use-company-details.modal";
import { DeleteAlert } from "./section/delete-alert";
import type { companies } from "@/db/schema";
import type { CompanyStatus } from "@/type/company.type";
import { useState } from "react";

type Company = typeof companies.$inferSelect;

interface CompanyDetailsModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  company: Company | null;
  onDelete: (companyId: number) => void;
  onStatusChange: (companyId: number, newStatus: CompanyStatus) => void;
}

export function CompanyDetailsModal({
  isOpen,
  onOpenChange,
  company,
  onDelete,
  onStatusChange,
}: CompanyDetailsModalProps) {
  const hook = useCompanyDetailsModal(company, onDelete, onStatusChange);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  if (!company) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{company.name}</DialogTitle>
            <HeaderActions
              currentStatus={company.status}
              onStatusChange={hook.handleStatusChange}
              onDeleteClick={() => setIsAlertOpen(true)}
              isUpdating={hook.isUpdatingStatus}
            />
          </DialogHeader>

          <Tabs defaultValue="interactions" className="h-full">
            <TabsList>
              <TabsTrigger value="interactions">Interactions</TabsTrigger>
              <TabsTrigger value="company-details">Company Details</TabsTrigger>
            </TabsList>

            <TabsContent value="interactions" className="h-full">
              <InteractionsTab company={company} {...hook} />
            </TabsContent>

            <TabsContent value="company-details">
              <DetailsTab company={company} />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <DeleteAlert
        open={isAlertOpen}
        onOpenChange={setIsAlertOpen}
        handleDelete={hook.handleDeleteCompany}
        isPending={hook.isPending}
      />
    </>
  );
}
