import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex min-h-svh w-full flex-1 flex-col items-start justify-start gap-4">
      <div className="flex w-full items-baseline justify-between">
        <Skeleton className="w-64 h-12" />
        <Skeleton className="w-44 h-12" />
      </div>
      <div className="flex flex-row w-full h-[40vh] gap-4">
        <Skeleton className="w-full h-full" />
        <Skeleton className="w-full h-full" />
        <Skeleton className="w-full h-full" />
        <Skeleton className="w-full h-full" />
      </div>
    </div>
  );
}
