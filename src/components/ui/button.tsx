"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer select-none",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 active:scale-[0.98]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 active:scale-[0.98]",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        gradient:
          "bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 text-white shadow-lg hover:from-rose-600 hover:via-pink-600 hover:to-purple-700 active:scale-[0.98] hover:shadow-xl",
        glass:
          "glass text-foreground hover:bg-white/80 dark:hover:bg-white/10 active:scale-[0.98]",
        glow: "bg-primary text-primary-foreground shadow-glow hover:bg-primary/90 active:scale-[0.98]",
        premium:
          "bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white shadow-lg hover:from-amber-600 hover:via-orange-600 hover:to-rose-600 active:scale-[0.98] hover:shadow-xl",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        xl: "h-14 rounded-2xl px-10 text-lg",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-12 w-12",
      },
      loading: {
        true: "pointer-events-none",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      isLoading = false,
      loading,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading || !!loading;
    const buttonClassName = cn(buttonVariants({ variant, size, loading: !!(loading || isLoading), className }));

    if (asChild) {
      if (!React.isValidElement(children)) {
        throw new Error("Button with asChild must have a single React element child.");
      }
      const childProps = (children.props || {}) as Record<string, unknown>;
      return React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
        ...props,
        className: cn(buttonClassName, childProps.className as string | undefined),
        ref,
      });
    }

    return (
      <button
        className={buttonClassName}
        ref={ref}
        disabled={isDisabled || undefined}
        {...props}
      >
        {(isLoading || loading) && (
          <Loader2 className="h-4 w-4 animate-spin" />
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };