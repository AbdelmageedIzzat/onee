"use client";
import Image from "next/image";
import { formatSDG } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import type { Product } from "@/lib/products";

export default function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();

  return (
    <div className="card p-4 flex flex-col gap-3">
      <div className="relative w-full aspect-square">
        <Image src={product.image} alt={product.name} fill className="object-cover rounded-md" />
      </div>
      <h3 className="font-semibold">{product.name}</h3>
      <p className="text-slate-600">{formatSDG(product.price)}</p>
      <button className="btn" onClick={() => add(product)}>أضف إلى السلة</button>
    </div>
  );
}
