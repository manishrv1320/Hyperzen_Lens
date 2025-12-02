import Image from 'next/image';

export function Header() {
  return (
    <header className="py-4 px-4 md:px-6">
      <div className="container mx-auto flex items-center gap-2">
        <div className="flex items-center justify-center size-8 bg-primary rounded-full p-1">
          <svg
            className="w-full h-full text-primary-foreground"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8 8V16H11L11 12H14L14 16L17 16V8H14L14 12H11L11 8H8Z"
              fill="currentColor"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold font-headline text-primary">
          Hyperzen Lens
        </h1>
      </div>
    </header>
  );
}
