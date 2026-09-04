import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-sm border-3 border-black bg-white px-3 py-2 text-sm font-bold text-black shadow-[3px_3px_0px_#000000] placeholder:text-slate-500 focus:outline-none focus:shadow-[5px_5px_0px_#000000] focus:bg-[#FFFDF0] disabled:cursor-not-allowed disabled:opacity-50 transition-all",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };

