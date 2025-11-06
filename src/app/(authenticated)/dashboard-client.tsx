"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { companies } from "@/db/schema";

import { CreateCompanyModal } from "@/components/create-company-modal";
import { CompaniesKanbanClient } from "@/components/companies-kanban-client";
import { Button } from "@/components/ui/button";
import { updateCompanyStatus } from "@/app/actions/company";
import type { DragEndEvent } from "@/components/kibo-ui/kanban";
import { arrayMove } from "@dnd-kit/sortable";

type Company = typeof companies.$inferSelect;
type CompanyKanbanItem = Company & { column: string };

interface DashboardClientProps {
  companiesData: Company[];
}

export function DashboardClient({ companiesData }: DashboardClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [companiesList, setCompaniesList] = useState<CompanyKanbanItem[]>(() =>
    companiesData.map((c) => ({ ...c, column: c.status }))
  );

  function handleCompanyCreated(newCompany: Company) {
    const newKanbanItem = { ...newCompany, column: newCompany.status };
    setCompaniesList((prevData) => [newKanbanItem, ...prevData]);
  }

  function handleDragOver(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const activeCard = companiesList.find((c) => String(c.id) === activeId);
    if (!activeCard) return;

    const overCard = companiesList.find((c) => String(c.id) === overId);

    const overColumnId = overCard ? overCard.column : overId;

    if (activeCard.column !== overColumnId) {
      setCompaniesList((prev) =>
        prev.map((card) =>
          String(card.id) === activeId
            ? {
                ...card,
                column: overColumnId,
                status: overColumnId as Company["status"],
              }
            : card
        )
      );
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const activeCard = companiesList.find((c) => String(c.id) === activeId);
    if (!activeCard) return;

    const newStatus = activeCard.status;
    const companyId = activeCard.id;

    const result = await updateCompanyStatus(companyId, newStatus);
    if (result?.error) {
      toast.error(result.error);
    }

    if (activeId !== overId) {
      const oldIndex = companiesList.findIndex(
        (c) => String(c.id) === activeId
      );
      const newIndex = companiesList.findIndex((c) => String(c.id) === overId);
      if (oldIndex !== -1 && newIndex !== -1) {
        setCompaniesList((prev) => arrayMove(prev, oldIndex, newIndex));
      }
    }
  }

  return (
    <div className="flex flex-1 flex-col w-full p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button onClick={() => setIsModalOpen(true)}>Create Company</Button>
      </div>

      <CreateCompanyModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        onCompanyCreated={handleCompanyCreated}
      />

      <CompaniesKanbanClient
        companiesList={companiesList}
        handleDragOver={handleDragOver}
        handleDragEnd={handleDragEnd}
      />
    </div>
  );
}
