import Link from "next/link";
import { Home, Search, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center max-w-lg">
        <div className="relative mb-8">
          <h1 className="text-[10rem] font-bold text-primary/10 leading-none select-none">404</h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="p-4 rounded-full bg-primary/10">
              <Search className="h-12 w-12 text-primary" />
            </div>
          </div>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold mb-3">Page Not Found</h2>
        <p className="text-muted-foreground mb-8">
          The page you are looking for does not exist or has been moved. Let us help you find your way.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/" className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground text-sm font-medium transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Link>
          <Link href="/" className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-colors">
            <Home className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
