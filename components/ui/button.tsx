import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center rounded-sm border-3 border-black text-sm font-extrabold uppercase tracking-wide transition-all outline-none select-none active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#000000] disabled:pointer-events-none disabled:opacity-50 cursor-pointer [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-[#F5FF00] text-black shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5",
        outline:
          "bg-white text-black shadow-[4px_4px_0px_#000000] hover:bg-[#FAF8F5] hover:shadow-[6px_6px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5",
        secondary:
          "bg-[#00F0FF] text-black shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5",
        purple:
          "bg-[#8A2BE2] text-white shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5",
        pink:
          "bg-[#FF3EA5] text-white shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5",
        green:
          "bg-[#00FF66] text-black shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5",
        destructive:
          "bg-[#FF4D4D] text-white shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5",
        ghost:
          "border-transparent bg-transparent text-black hover:bg-black/5 shadow-none hover:shadow-none",
        link: "border-none shadow-none text-black underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2 text-sm",
        xs: "h-7 px-2.5 text-xs border-2 shadow-[2px_2px_0px_#000000]",
        sm: "h-8 px-3 text-xs shadow-[3px_3px_0px_#000000]",
        lg: "h-12 px-6 text-base shadow-[5px_5px_0px_#000000]",
        icon: "size-10",
        "icon-xs": "size-7 border-2 shadow-[2px_2px_0px_#000000]",
        "icon-sm": "size-8 shadow-[3px_3px_0px_#000000]",
        "icon-lg": "size-12 shadow-[5px_5px_0px_#000000]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };

