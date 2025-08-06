import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="border-b bg-white px-4 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <h1 className="text-xl font-bold text-center flex-1 md:text-left md:flex-initial">
          OderManager2
        </h1>
        <div className="hidden md:block">
          <Button asChild variant="outline">
            <Link href="/display">呼び出し画面を開く</Link>
          </Button>
        </div>
      </div>
      {/* Mobile display button */}
      <div className="mt-2 md:hidden">
        <Button asChild variant="outline" className="w-full">
          <Link href="/display">呼び出し画面を開く</Link>
        </Button>
      </div>
    </header>
  );
}
