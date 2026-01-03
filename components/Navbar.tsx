"use client";
import Link from "next/link";
import SearchBar from "./SearchBar";
import { useCart } from "@/context/CartContext";

export default function Navbar() {
  const { items } = useCart();
  const count = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <header className="bg-white border-b">
      <div className="container py-4 flex items-center gap-4">
        <Link href="/" className="text-xl font-bold">متجر عربي</Link>
        <nav className="flex items-center gap-4 ml-auto">
          <SearchBar />
          <Link href="/cart" className="btn-secondary">السلة ({count})</Link>
        </nav>
      </div>
    </header>
  );
}
