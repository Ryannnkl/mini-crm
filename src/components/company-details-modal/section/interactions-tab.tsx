import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { DialogFooter } from "@/components/ui/dialog";
import { Send } from "lucide-react";
import { useState } from "react";
import type { interactions, companies } from "@/db/schema";
import { createInteraction, getInteractions } from "@/app/actions/interaction";
import { toast } from "sonner";
import { getUserData } from "@/app/actions/user";
import { useQuery, useQueryClient } from "@tanstack/react-query";

type Company = typeof companies.$inferSelect;

interface InteractionsTabProps {
  company: Company | null;
}

export function InteractionsTab({ company }: InteractionsTabProps) {
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);
  const [newInteractionContent, setNewInteractionContent] =
    useState<string>("");

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: getUserData,
  });

  const {
    data: interactions,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["interactions", company?.id],
    queryFn: async () => {
      if (!company) return [];
      const res = await getInteractions(company.id);
      if (res.error) {
        throw new Error(res.error);
      }
      return res.interactions;
    },
    enabled: !!company,
  });

  if (isError) {
    toast.error(error.message);
  }

  const handleAddInteraction = async () => {
    if (!company || !newInteractionContent.trim()) return;
    setIsPending(true);
    const result = await createInteraction(company.id, newInteractionContent);
    if (result.error) {
      toast.error(result.error);
    } else if (result.interaction) {
      toast.success(result.success);
      setNewInteractionContent("");
      queryClient.invalidateQueries({
        queryKey: ["interactions", company.id],
      });
    }
    setIsPending(false);
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="px-6 h-full">
        <div className="space-y-6 py-4">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : interactions && interactions.length > 0 ? (
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
            onChange={(e) => setNewInteractionContent(e.target.value)}
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
    </div>
  );
}
