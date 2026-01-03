"use client";
import { useCart } from "@/context/CartContext";
import { formatSDG } from "@/lib/utils";
import Link from "next/link";

export default function CartPage() {
  const { items, remove, setQty, total } = useCart();

  return (
    <section>
      <h1 className="text-2xl font-bold mb-4">السلة</h1>
      {items.length === 0 ? (
        <p>سلتك فارغة. <Link href="/" className="text-primary">تسوق الآن</Link></p>
      ) : (
        <>
          <div className="flex flex-col gap-4">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="card p-4 flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold">{product.name}</h3>
                  <p className="text-slate-600">{formatSDG(product.price)} × {quantity}</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    className="border rounded-md px-2 py-1 w-20"
                    onChange={e => setQty(product.id, parseInt(e.target.value || "1", 10))}
                  />
                  <button className="btn" onClick={() => remove(product.id)}>إزالة</button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 card p-4 flex items-center justify-between">
            <span className="font-semibold">المجموع: {formatSDG(total)}</span>
            <Link href="/checkout" className="btn-secondary">اكمال الشراء</Link>
          </div>
        </>
      )}
    </section>
  );
}
