import { products } from "@/lib/products";
import { categories } from "@/lib/categories";
import ProductCard from "./ProductCard";

export default function ProductList({ q, cat }: { q?: string | null; cat?: string | null }) {
  const query = (q ?? "").trim().toLowerCase();
  const catId = (cat ?? "").trim();

  const filtered = products.filter(p => {
    const byCat = catId ? p.categoryId === catId : true;
    const byQuery = query ? (p.name.toLowerCase().includes(query) || (p.description ?? "").toLowerCase().includes(query)) : true;
    return byCat && byQuery;
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {filtered.map(p => <ProductCard key={p.id} product={p} />)}
      {filtered.length === 0 && <p>لا توجد نتائج مطابقة.</p>}
    </div>
  );
}

export function CategoryTabs({ active }: { active?: string | null }) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <a href="/" className={`btn-secondary ${!active ? "" : "opacity-70"}`}>الكل</a>
      {categories.map(c => (
        <a key={c.id} href={`/?cat=${c.id}`} className={`btn-secondary ${active === c.id ? "" : "opacity-70"}`}>{c.name}</a>
      ))}
    </div>
  );
}
