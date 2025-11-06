"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { companies, interactions as interactionsTable } from "@/db/schema";

import { deleteCompany } from "@/app/actions/company";
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

type Company = typeof companies.$inferSelect;
type Interaction = typeof interactionsTable.$inferSelect;
type User = Awaited<ReturnType<typeof getUserData>>;

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
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newInteractionContent, setNewInteractionContent] = useState("");
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
      setNewInteractionContent("");
    }
    setIsPending(false);
  }

  if (!company) {
    return null;
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{company.name}</DialogTitle>
          </DialogHeader>

          <div className="-mx-6 -my-2 h-[1px] bg-border" />

          <div className="flex flex-col space-y-4 py-4">
            <h3 className="font-semibold">Interactions</h3>

            <div className="flex flex-col gap-2">
              <Textarea
                placeholder="Add a new interaction..."
                value={newInteractionContent}
                onChange={(e) => setNewInteractionContent(e.target.value)}
                disabled={isPending}
              />
              <Button
                onClick={handleAddInteraction}
                disabled={isPending || !newInteractionContent.trim()}
                className="self-end"
              >
                {isPending ? "Saving..." : "Save"}
              </Button>
            </div>

            <ScrollArea className="h-64 pr-4">
              <div className="space-y-6">
                {isLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ) : interactions.length > 0 ? (
                  interactions.map((interaction) => (
                    <div
                      key={interaction.id}
                      className="flex items-start gap-3"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.image ?? undefined} />
                        <AvatarFallback>
                          {user?.name?.charAt(0) ?? "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <p className="font-semibold">
                            {user?.name ?? "User"}
                          </p>{" "}
                          <p>
                            {new Date(interaction.createdAt).toLocaleString(
                              [],
                              {
                                dateStyle: "short",
                                timeStyle: "short",
                              }
                            )}
                          </p>
                        </div>
                        <div className="mt-1 rounded-md bg-secondary p-3 text-sm">
                          <p>{interaction.content}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-sm text-muted-foreground py-8">
                    No interactions yet.
                  </p>
                )}
              </div>
            </ScrollArea>
          </div>

          <div className="-mx-6 -my-2 h-[1px] bg-border" />

          <DialogFooter className="pt-4">
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
