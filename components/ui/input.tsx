import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 lg:h-9 rounded-md border border-line bg-control px-3 text-sm text-foreground placeholder:text-muted-foreground transition-colors duration-100 hover:border-muted-foreground/40 disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
