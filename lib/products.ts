export type Product = {
  id: string;
  name: string;
  price: number;
  categoryId: string;
  image: string;
  description?: string;
};

export const products: Product[] = [
  { id: "p1", name: "أحمر شفاه فاخر", price: 4500, categoryId: "cosmetics", image: "/images/lipstick.jpg", description: "تثبيت طويل ولمعان أنيق." },
  { id: "p2", name: "عطر شرقي", price: 12000, categoryId: "cosmetics", image: "/images/perfume.jpg", description: "نفحات فريدة تناسب السهرات." },
  { id: "p3", name: "قلادة معدنية", price: 8000, categoryId: "accessories", image: "/images/necklace.jpg", description: "تصميم بسيط ولمسة أنيقة." },
  { id: "p4", name: "حقيبة يد", price: 15000, categoryId: "accessories", image: "/images/bag.jpg", description: "جودة عالية ومساحة عملية." },
  { id: "p5", name: "قميص قطن", price: 9000, categoryId: "clothing", image: "/images/shirt.jpg", description: "راحة يومية وخامة ممتازة." },
  { id: "p6", name: "حذاء رياضي", price: 22000, categoryId: "clothing", image: "/images/shoes.jpg", description: "ثبات وراحة للمشي الطويل." },
  { id: "p7", name: "سماعات لاسلكية", price: 30000, categoryId: "electronics", image: "/images/earbuds.jpg", description: "صوت واضح وعزل ضوضاء." },
  { id: "p8", name: "شاحن سريع", price: 7000, categoryId: "electronics", image: "/images/charger.jpg", description: "شحن فعال وأمان عالي." }
];
