import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("animate-pulse bg-bg-tertiary", className)}
      data-slot="skeleton"
      {...props}
    />
  );
}

export { Skeleton };
