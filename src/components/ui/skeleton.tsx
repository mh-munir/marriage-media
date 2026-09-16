import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
"animate-pulse rounded-xl bg-linear-to-r from-muted via-muted/50 to-muted",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };