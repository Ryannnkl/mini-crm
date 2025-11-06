"use client";

import type {
  Announcements,
  DndContextProps,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useDroppable,
  useSensor,
  useSensors,
  pointerWithin,
} from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  createContext,
  type HTMLAttributes,
  type ReactNode,
  useContext,
  useState,
  useMemo,
} from "react";
import { createPortal } from "react-dom";
import { Card } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export type { DragEndEvent } from "@dnd-kit/core";

type KanbanItemProps = {
  id: string | number;
  name: string;
  column: string;
} & Record<string, unknown>;

type KanbanColumnProps = {
  id: string;
  name: string;
} & Record<string, unknown>;

type KanbanContextProps<
  T extends KanbanItemProps = KanbanItemProps,
  C extends KanbanColumnProps = KanbanColumnProps
> = {
  columns: C[];
  data: T[];
  activeCard: T | null;
};

const KanbanContext = createContext<KanbanContextProps>({
  columns: [],
  data: [],
  activeCard: null,
});

export type KanbanBoardProps = {
  id: string;
  children: ReactNode;
  className?: string;
};

export const KanbanBoard = ({ id, children, className }: KanbanBoardProps) => {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  return (
    <div
      className={cn(
        "flex size-full min-h-40 flex-col divide-y overflow-hidden rounded-md border bg-secondary text-xs shadow-sm ring-2 transition-all",
        isOver ? "ring-primary" : "ring-transparent",
        className
      )}
      ref={setNodeRef}
    >
      {children}
    </div>
  );
};

export type KanbanCardProps<T extends KanbanItemProps = KanbanItemProps> = T & {
  children?: ReactNode;
  className?: string;
  onClick?: () => void;
};

export const KanbanCard = <T extends KanbanItemProps = KanbanItemProps>({
  id,
  name,
  children,
  className,
  onClick,
}: KanbanCardProps<T>) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transition,
    transform,
    isDragging,
  } = useSortable({
    id: String(id),
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  return (
    <div style={style} ref={setNodeRef}>
      <Card
        {...listeners}
        {...attributes}
        onClick={onClick}
        className={cn(
          "cursor-grab gap-4 rounded-md p-3 shadow-sm",
          onClick && "cursor-pointer",
          isDragging && "opacity-30",
          className
        )}
      >
        {children ?? <p className="m-0 font-medium text-sm">{name}</p>}
      </Card>
    </div>
  );
};

export type KanbanCardsProps<T extends KanbanItemProps = KanbanItemProps> =
  Omit<HTMLAttributes<HTMLDivElement>, "children" | "id"> & {
    children: (item: T) => ReactNode;
    id: string;
  };

export const KanbanCards = <T extends KanbanItemProps = KanbanItemProps>({
  children,
  className,
  id,
  ...props
}: KanbanCardsProps<T>) => {
  const { data } = useContext(KanbanContext) as KanbanContextProps<T>;
  const filteredData = data.filter((item) => item.column === id);
  const items = useMemo(() => filteredData.map((item) => String(item.id)), [
    filteredData,
  ]);

  return (
    <ScrollArea className="overflow-hidden">
      <SortableContext items={items}>
        <div
          className={cn("flex flex-grow flex-col gap-2 p-2", className)}
          {...props}
        >
          {filteredData.map(children)}
        </div>
      </SortableContext>
      <ScrollBar orientation="vertical" />
    </ScrollArea>
  );
};

export type KanbanHeaderProps = HTMLAttributes<HTMLDivElement>;

export const KanbanHeader = ({ className, ...props }: KanbanHeaderProps) => (
  <div className={cn("m-0 p-2 font-semibold text-sm", className)} {...props} />
);

export type KanbanProviderProps<
  T extends KanbanItemProps = KanbanItemProps,
  C extends KanbanColumnProps = KanbanColumnProps
> = Omit<DndContextProps, "children"> & {
  children: (column: C) => ReactNode;
  className?: string;
  columns: C[];
  data: T[];
  onDataChange?: (data: T[]) => void;
  onDragStart?: (event: DragStartEvent) => void;
  onDragEnd?: (event: DragEndEvent) => void;
  onDragOver?: (event: DragOverEvent) => void;
};

export const KanbanProvider = <
  T extends KanbanItemProps = KanbanItemProps,
  C extends KanbanColumnProps = KanbanColumnProps
>({
  children,
  onDragStart,
  onDragEnd,
  onDragOver,
  className,
  columns,
  data,
  ...props
}: Omit<KanbanProviderProps<T, C>, "onDataChange">) => {
  const [activeCard, setActiveCard] = useState<T | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      // Só ativa o arraste se o mouse se mover mais de 5px
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      // Pressione por 250ms ou mova mais de 5px para arrastar em mobile
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event: DragStartEvent) => {
    const card = data.find((item) => String(item.id) === event.active.id);
    if (card) {
      setActiveCard(card);
    }
    onDragStart?.(event);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveCard(null);
    onDragEnd?.(event);
  };

  const announcements: Announcements = {
    onDragStart({ active }) {
      const { name, column } = data.find((item) => String(item.id) === active.id) ?? {};
      return `Picked up the card "${name}" from the "${column}" column`;
    },
    onDragOver({ active, over }) {
      const { name } = data.find((item) => String(item.id) === active.id) ?? {};
      const newColumn = columns.find((column) => column.id === over?.id)?.name;
      return `Dragged the card "${name}" over the "${newColumn}" column`;
    },
    onDragEnd({ active, over }) {
      const { name } = data.find((item) => String(item.id) === active.id) ?? {};
      const newColumn = columns.find((column) => column.id === over?.id)?.name;
      return `Dropped the card "${name}" into the "${newColumn}" column`;
    },
    onDragCancel({ active }) {
      const { name } = data.find((item) => String(item.id) === active.id) ?? {};
      return `Cancelled dragging the card "${name}"`;
    },
  };

  return (
    <KanbanContext.Provider value={{ columns, data, activeCard }}>
      <DndContext
        accessibility={{ announcements }}
        collisionDetection={pointerWithin}
        onDragEnd={handleDragEnd}
        onDragOver={onDragOver}
        onDragStart={handleDragStart}
        sensors={sensors}
        {...props}
      >
        <div
          className={cn(
            "grid size-full auto-cols-fr grid-flow-col gap-4",
            className
          )}
        >
          {columns.map((column) => children(column))}
        </div>
        {typeof window !== "undefined" &&
          activeCard &&
          createPortal(
            <DragOverlay>
              <KanbanCard {...activeCard}>
                <p className="m-0 font-medium text-sm">{activeCard.name}</p>
              </KanbanCard>
            </DragOverlay>,
            document.body
          )}
      </DndContext>
    </KanbanContext.Provider>
  );
};


