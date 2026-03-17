import { Skeleton } from "@/components/ui/skeleton";

export default function RootLoading() {
  return (
    <main className="container space-y-8 py-8 lg:py-10">
      <Skeleton className="h-[320px] w-full rounded-[2rem]" />
      <div className="grid gap-5 xl:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-[320px] w-full rounded-[2rem]" />
        ))}
      </div>
    </main>
  );
}
