import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-sm border-2 border-black px-2.5 py-0.5 text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_#000000] select-none",
  {
    variants: {
      variant: {
        default: "bg-[#F5FF00] text-black",
        secondary: "bg-[#00F0FF] text-black",
        destructive: "bg-[#FF3EA5] text-white",
        outline: "bg-white text-black",
        cyan: "bg-[#00F0FF] text-black",
        purple: "bg-[#8A2BE2] text-white",
        green: "bg-[#00FF66] text-black",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };

