"use client";

import type { companies } from "@/db/schema";
import {
  KanbanBoard,
  KanbanCard,
  KanbanCards,
  KanbanHeader,
  KanbanProvider,
  type DragEndEvent,
} from "@/components/kibo-ui/kanban";

const columns = [
  { id: "lead", name: "Lead", color: "#848484" },
  { id: "negotiating", name: "Negotiating", color: "#f59e0b" },
  { id: "won", name: "Won", color: "#10b981" },
  { id: "lost", name: "Lost", color: "#ef4444" },
];

type CompanyKanbanItem = typeof companies.$inferSelect & { column: string };

interface CompaniesKanbanClientProps {
  companiesList: CompanyKanbanItem[];
  handleDragOver: (event: DragEndEvent) => void;
  handleDragEnd: (event: DragEndEvent) => Promise<void>;
}

export function CompaniesKanbanClient({
  companiesList,
  handleDragOver,
  handleDragEnd,
}: CompaniesKanbanClientProps) {
  return (
    <KanbanProvider
      columns={columns}
      data={companiesList}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      {(column) => (
        <KanbanBoard id={column.id} key={column.id}>
          <KanbanHeader>
            <div className="flex items-center gap-2">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: column.color }}
              />
              <span>{column.name}</span>
              <span className="text-muted-foreground text-sm">
                ({companiesList.filter((c) => c.status === column.id).length})
              </span>
            </div>
          </KanbanHeader>
          <KanbanCards id={column.id}>
            {(company: CompanyKanbanItem) => (
              <KanbanCard
                id={String(company.id)}
                key={company.id}
                name={company.name}
                column={company.status}
              >
                <p className="m-0 font-medium text-sm">{company.name}</p>
              </KanbanCard>
            )}
          </KanbanCards>
        </KanbanBoard>
      )}
    </KanbanProvider>
  );
}
