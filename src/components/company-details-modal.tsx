"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { companies, interactions as interactionsTable } from "@/db/schema";
import { MoreVertical, Send } from "lucide-react";

import { deleteCompany, updateCompanyStatus } from "@/app/actions/company";
import { createInteraction, getInteractions } from "@/app/actions/interaction";
import { getUserData } from "@/app/actions/user";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import type { CompanyStatus } from "@/type/company.type";

const columns = [
  { id: "lead", name: "Lead" },
  { id: "negotiating", name: "Negotiating" },
  { id: "won", name: "Won" },
  { id: "lost", name: "Lost" },
];

type Company = typeof companies.$inferSelect;
type Interaction = typeof interactionsTable.$inferSelect;
type User = Awaited<ReturnType<typeof getUserData>>;

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
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newInteractionContent, setNewInteractionContent] =
    useState<CompanyStatus>("lead");
  const [user, setUser] = useState<User>(null);

  useEffect(() => {
    if (isOpen && company) {
      let isMounted = true;

      const fetchData = async () => {
        setIsLoading(true);
        try {
          const [interactionsResult, userData] = await Promise.all([
            getInteractions(company.id),
            getUserData(),
          ]);

          if (!isMounted) return;

          if (interactionsResult.error) {
            toast.error(interactionsResult.error);
          } else if (interactionsResult.interactions) {
            setInteractions(interactionsResult.interactions);
          }
          setUser(userData);
        } catch (error) {
          toast.error("Failed to load data");
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      };

      fetchData();

      return () => {
        isMounted = false;
      };
    }
  }, [isOpen, company]);

  async function handleDelete() {
    if (!company) return;
    setIsPending(true);
    const result = await deleteCompany(company.id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(result.success);
      onDelete(company.id);
    }
    setIsPending(false);
    setIsAlertOpen(false);
  }

  async function handleAddInteraction() {
    if (!company || !newInteractionContent.trim()) return;
    setIsPending(true);
    const result = await createInteraction(company.id, newInteractionContent);
    if (result.error) {
      toast.error(result.error);
    } else if (result.interaction) {
      toast.success(result.success);
      setInteractions((prev) => [result.interaction!, ...prev]);
      setNewInteractionContent("lead");
    }
    setIsPending(false);
  }

  async function handleStatusChange(newStatus: CompanyStatus) {
    if (!company || newStatus === company.status) return;

    setIsUpdatingStatus(true);
    const result = await updateCompanyStatus(company.id, newStatus);
    setIsUpdatingStatus(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(result.success);
      onStatusChange(company.id, newStatus);
    }
  }

  if (!company) {
    return null;
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent
          showCloseButton={false}
          className="max-w-2xl grid-rows-[auto_auto_1fr_auto] flex flex-col h-[90vh] max-h-[700px] items-stretch justify-between"
        >
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>{company.name}</DialogTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="flex-shrink-0">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="text-red-500 focus:text-red-500 focus:bg-red-50"
                    onClick={() => setIsAlertOpen(true)}
                  >
                    Delete Company
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </DialogHeader>

          <div className="flex w-full items-end justify-end">
            <Select
              defaultValue={company.status}
              onValueChange={handleStatusChange}
              disabled={isUpdatingStatus}
            >
              <SelectTrigger className="self-end">
                <SelectValue placeholder="Change status..." />
              </SelectTrigger>
              <SelectContent>
                {columns.map((col) => (
                  <SelectItem key={col.id} value={col.id}>
                    {col.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <ScrollArea className="pr-4 -mx-6 px-6 h-full">
            <div className="space-y-6 py-4">
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : interactions.length > 0 ? (
                interactions.map((interaction) => (
                  <div key={interaction.id} className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.image ?? undefined} />
                      <AvatarFallback>
                        {user?.name?.charAt(0) ?? "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <p className="font-semibold">{user?.name ?? "User"}</p>{" "}
                        <p>
                          {new Date(interaction.createdAt).toLocaleString([], {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </p>
                      </div>
                      <div className="mt-1 rounded-md bg-secondary p-3 text-sm">
                        <p>{interaction.content}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No interactions yet.
                </p>
              )}
            </div>
          </ScrollArea>

          <DialogFooter className="pt-4">
            <div className="flex w-full items-start gap-2">
              <Textarea
                placeholder="Add a new interaction..."
                value={newInteractionContent}
                onChange={(e) =>
                  setNewInteractionContent(e.target.value as CompanyStatus)
                }
                disabled={isPending}
                className="min-h-12 max-h-24"
              />
              <Button
                type="button"
                onClick={handleAddInteraction}
                disabled={isPending || !newInteractionContent.trim()}
                className="flex-shrink-0 h-full"
              >
                {isPending ? <Spinner /> : <Send className="h-5 w-5" />}
              </Button>
            </div>
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
