"use client";

import * as React from "react";
import { useInView } from "react-intersection-observer";
import { Loader2 } from "lucide-react";

interface LazyLoadingProps {
  children: React.ReactNode;
  onLoadMore?: () => void;
  loading?: boolean;
  hasMore?: boolean;
  threshold?: number;
}

/**
 * Infinite scroll wrapper using intersection observer.
 */
export function LazyLoading({
  children,
  onLoadMore,
  loading = false,
  hasMore = true,
  threshold = 0.5,
}: LazyLoadingProps) {
  const { ref, inView } = useInView({
    threshold,
    rootMargin: "200px",
  });

  React.useEffect(() => {
    if (inView && hasMore && !loading && onLoadMore) {
      onLoadMore();
    }
  }, [inView, hasMore, loading, onLoadMore]);

  return (
    <div>
      {children}
      {hasMore && (
        <div ref={ref} className="flex items-center justify-center py-8">
          {loading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Loading more...</span>
            </div>
          )}
        </div>
      )}
      {!hasMore && (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">No more items to load</p>
        </div>
      )}
    </div>
  );
}

interface LazyComponentProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Lazy-load a component when it enters the viewport.
 */
export function LazyComponent({
  children,
  fallback,
}: LazyComponentProps) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
    rootMargin: "100px",
  });

  return (
    <div ref={ref}>
      {inView
        ? children
        : fallback || (
            <div className="min-h-50 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}
    </div>
  );
}