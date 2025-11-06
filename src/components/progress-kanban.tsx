"use client";

import type { DragEndEvent } from "@/components/kibo-ui/kanban";
import {
  KanbanBoard,
  KanbanCard,
  KanbanCards,
  KanbanHeader,
  KanbanProvider,
} from "@/components/kibo-ui/kanban";
import { useState } from "react";

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

const columns = [
  { id: "1", name: "Planned", color: "#6B7280" },
  { id: "2", name: "In Progress", color: "#F59E0B" },
  { id: "3", name: "Done", color: "#10B981" },
];

const users = Array.from({ length: 4 })
  .fill(null)
  .map(() => ({
    id: "",
    name: "",
    image: "",
  }));

const exampleFeatures = Array.from({ length: 20 })
  .fill(null)
  .map((_, index) => ({
    id: index.toString(),
    name: "Feature " + index,
    startAt: new Date(),
    endAt: new Date(),
    column:
      /* random column */ columns[Math.floor(Math.random() * columns.length)]
        .id,
    owner: /* random owner */ users[Math.floor(Math.random() * users.length)],
  }));

export const ProgressKanban = () => {
  const [features, setFeatures] = useState(exampleFeatures);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      return;
    }

    const status = columns.find(({ id }) => id === over.id);

    if (!status) {
      return;
    }

    setFeatures(
      features.map((feature) => {
        if (feature.id === active.id) {
          return { ...feature, column: status.id };
        }

        return feature;
      })
    );
  };

  return (
    <KanbanProvider columns={columns} data={features} onDragEnd={handleDragEnd}>
      {(column) => (
        <KanbanBoard id={column.id} key={column.id}>
          <KanbanHeader>{column.name}</KanbanHeader>
          <KanbanCards id={column.id}>
            {(feature) => (
              <KanbanCard
                column={column.name}
                id={feature.id}
                key={feature.id}
                name={feature.name}
              />
            )}
          </KanbanCards>
        </KanbanBoard>
      )}
    </KanbanProvider>
  );
};
