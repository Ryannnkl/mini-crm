import { Skeleton } from "@/components/ui/skeleton";

export default function AccountLoading() {
  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-2xl mx-auto">
      <Skeleton className="h-8 w-48 rounded-md" />
      <div className="space-y-8 pt-2">
        <div className="space-y-3">
          <Skeleton className="h-5 w-32 rounded-md" />
          <div className="flex flex-col items-center gap-4 pt-2">
            <Skeleton className="size-36 rounded-full" />
            <Skeleton className="h-24 w-full rounded-md" />
          </div>
        </div>

        <div className="space-y-3">
          <Skeleton className="h-5 w-16 rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>

        <Skeleton className="h-10 w-32 rounded-md" />
      </div>
    </div>
  );
}