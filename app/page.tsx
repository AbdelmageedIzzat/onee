import ProductList, { CategoryTabs } from "@/components/ProductList";
import { categories } from "@/lib/categories";

export default function Home({ searchParams }: { searchParams?: { q?: string; cat?: string } }) {
  const q = searchParams?.q ?? null;
  const cat = searchParams?.cat ?? null;

  return (
    <section>
      <h1 className="text-2xl font-bold mb-4">اكتشف منتجاتنا</h1>
      <CategoryTabs active={cat} />
      <ProductList q={q} cat={cat} />
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-2">تصنيفاتنا</h2>
        <ul className="list-disc mr-5 text-slate-700">
          {categories.map(c => <li key={c.id}>{c.name}</li>)}
        </ul>
      </div>
    </section>
  );
}
