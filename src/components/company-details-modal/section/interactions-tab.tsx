import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { DialogFooter } from "@/components/ui/dialog";
import { Send } from "lucide-react";
import { useEffect, useState } from "react";
import type { interactions, companies } from "@/db/schema";
import type { User } from "better-auth";
import { createInteraction, getInteractions } from "@/app/actions/interaction";
import { toast } from "sonner";
import { getUserData } from "@/app/actions/user";

type Interaction = typeof interactions.$inferSelect;
type Company = typeof companies.$inferSelect;

interface InteractionsTabProps {
  company: Company | null;
}

export function InteractionsTab({ company }: InteractionsTabProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [isPending, setIsPending] = useState(false);
  const [newInteractionContent, setNewInteractionContent] =
    useState<string>("");
  const [user, setUser] = useState<User>();

  useEffect(() => {
    if (company) {
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
  }, [company]);

  const handleAddInteraction = async () => {
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
