"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  const allItems = [{ label: "Home", href: "/" }, ...items];

  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center space-x-1 text-sm text-muted-foreground ${className}`}
    >
      <ol className="flex items-center flex-wrap space-x-1" itemScope itemType="https://schema.org/BreadcrumbList">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;

          return (
            <li
              key={item.href}
              className="flex items-center"
              itemScope
              itemProp="itemListElement"
              itemType="https://schema.org/ListItem"
            >
              {index > 0 && (
                <ChevronRight className="h-3.5 w-3.5 mx-1 shrink-0 text-muted-foreground/50" />
              )}

              {isLast ? (
                <span
                  className="font-medium text-foreground"
                  itemProp="name"
                  aria-current="page"
                >
                  {index === 0 ? (
                    <Home className="h-3.5 w-3.5" />
                  ) : (
                    item.label
                  )}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-primary transition-colors hover:underline underline-offset-4"
                  itemProp="item"
                >
                  <span itemProp="name">
                    {index === 0 ? (
                      <Home className="h-3.5 w-3.5" />
                    ) : (
                      item.label
                    )}
                  </span>
                </Link>
              )}

              <meta itemProp="position" content={String(index + 1)} />
            </li>
          );
        })}
      </ol>
    </nav>
  );
}