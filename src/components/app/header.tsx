import { Leaf } from "lucide-react";

export function Header() {
  return (
    <header className="py-4 px-4 md:px-6">
      <div className="container mx-auto flex items-center gap-2">
        <Leaf className="size-6 text-primary" />
        <h1 className="text-2xl font-bold font-headline text-primary">
          Verdant Vision
        </h1>
      </div>
    </header>
  );
}
