"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/providers/language-provider";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, icon, rightIcon, id, ...props }, ref) => {
    const { translateText } = useLanguage();
    const localizedLabel = label
      ? label.replace(/^(\d+)\. Name$/, (_, number) => `${number}. ${translateText("Name")}`)
      : label;
    const translatedLabel = localizedLabel ? translateText(localizedLabel) : localizedLabel;
    const localizedPlaceholder = typeof props.placeholder === "string" ? translateText(props.placeholder) : props.placeholder;
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-foreground"
          >
            {translatedLabel}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {icon}
            </div>
          )}
          <input
            type={type}
            id={inputId}
            dir="auto"
            className={cn(
              "flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm transition-all duration-200",
              "placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
              "disabled:cursor-not-allowed disabled:opacity-50",
              icon && "pl-10",
              rightIcon && "pr-10",
              error &&
                "border-destructive focus:ring-destructive/50",
              className
            )}
            ref={ref}
            {...props}
            placeholder={localizedPlaceholder}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="text-xs text-destructive mt-1">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
