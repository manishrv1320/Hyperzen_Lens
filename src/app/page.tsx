import { Header } from "@/components/app/header";
import { Footer } from "@/components/app/footer";
import { DiseaseDetector } from "@/components/app/disease-detector";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background relative">
       <div
        className="absolute inset-0 z-0 opacity-10"
        style={{
          backgroundImage:
            'url("https://www.transparenttextures.com/patterns/natural-paper.png")',
        }}
      />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <DiseaseDetector />
        </main>
        <Footer />
      </div>
    </div>
  );
}
