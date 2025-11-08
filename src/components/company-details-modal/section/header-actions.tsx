"use client";

import { Button } from "@/components/ui/button";
import { MoreVertical, TagIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { columns } from "@/components/companies-kanban-client";
import type { CompanyStatus } from "@/type/company.type";

interface HeaderActionsProps {
  currentStatus: CompanyStatus;
  onStatusChange: (status: CompanyStatus) => void;
  onDeleteClick: () => void;
  isUpdating: boolean;
}

export function HeaderActions({
  currentStatus,
  onStatusChange,
  onDeleteClick,
  isUpdating,
}: HeaderActionsProps) {
  return (
    <div className="flex items-end justify-end gap-2">
      <Select
        defaultValue={currentStatus}
        onValueChange={onStatusChange}
        disabled={isUpdating}
      >
        <SelectTrigger>
          <SelectValue placeholder="Change status..." />
        </SelectTrigger>
        <SelectContent>
          {columns.map((col) => (
            <SelectItem key={col.id} value={col.id}>
              <TagIcon className="h-5 w-5 mr-2" color={col.color} />
              {col.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            className="text-red-500 focus:text-red-500 focus:bg-red-50"
            onClick={onDeleteClick}
          >
            Delete Company
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
