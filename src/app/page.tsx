import { Header } from "@/components/app/header";
import { Footer } from "@/components/app/footer";
import { DiseaseDetector } from "@/components/app/disease-detector";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        <DiseaseDetector />
      </main>
      <Footer />
    </div>
  );
}
