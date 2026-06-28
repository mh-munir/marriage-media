import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center">
          Welcome to Marriage Media
        </h1>
        <p className="text-center text-muted-foreground mt-4">
          Find your perfect partner.
        </p>
        {/* Other sections like Featured Members, Testimonials will be added here */}
      </main>
      <Footer />
    </div>
  );
}