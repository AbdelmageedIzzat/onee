"use client";
import React from "react";
import { useCart } from "@/context/CartContext";
import { formatSDG } from "@/lib/utils";

type PaymentMethod = "cash" | "bankak" | "fawry" | "mykashi" | "okash";

export default function CheckoutPage() {
  const { items, total, clear } = useCart();
  const [payment, setPayment] = React.useState<PaymentMethod>("cash");
  const [address, setAddress] = React.useState("");
  const [phone, setPhone] = React.useState("");

  const storeWhatsApp = "2499XXXXXXX"; // ضع رقم واتساب المتجر هنا بصيغة دولية بدون + (مثال: 249912345678)

  const sendWhatsApp = () => {
    if (items.length === 0) return alert("سلتك فارغة.");
    if (!address.trim() || !phone.trim()) return alert("يرجى إدخال مكان الاستلام ورقم التواصل.");

    const lines = [
      "طلب جديد من موقع المتجر:",
      "",
      "المنتجات:",
      ...items.map(i => `- ${i.product.name} × ${i.quantity} = ${formatSDG(i.product.price * i.quantity)}`),
      "",
      `الإجمالي: ${formatSDG(total)}`,
      `طريقة الدفع: ${labelFor(payment)}`,
      `مكان الاستلام: ${address}`,
      `رقم التواصل: ${phone}`,
      "",
      "يرجى التأكيد."
    ];

    const message = encodeURIComponent(lines.join("\n"));
    const url = `https://wa.me/${storeWhatsApp}?text=${message}`;
    window.open(url, "_blank");
    clear();
  };

  return (
    <section>
      <h1 className="text-2xl font-bold mb-4">إتمام الشراء</h1>
      <div className="card p-4 mb-6">
        <h2 className="font-semibold mb-2">اختر طريقة الدفع</h2>
        <div className="flex flex-wrap gap-4">
          {(["cash","bankak","fawry","mykashi","okash"] as PaymentMethod[]).map(m => (
            <label key={m} className="flex items-center gap-2">
              <input type="radio" name="payment" checked={payment===m} onChange={() => setPayment(m)} />
              <span>{labelFor(m)}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="card p-4 mb-6">
        <h2 className="font-semibold mb-2">معلومات الاستلام</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">مكان الاستلام</label>
            <input className="border rounded-md px-3 py-2 w-full" placeholder="مثال: الخرطوم، شارع الستين، بالقرب من ..." value={address} onChange={e => setAddress(e.target.value)} />
          </div>
          <div>
            <label className="block mb-1">رقم التواصل</label>
            <input className="border rounded-md px-3 py-2 w-full" placeholder="مثال: 0912345678" value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="card p-4 mb-6">
        <h2 className="font-semibold mb-2">مراجعة الطلب</h2>
        {items.length === 0 ? <p>لا توجد عناصر في السلة.</p> : (
          <ul className="list-disc mr-5">
            {items.map(i => (
              <li key={i.product.id}>{i.product.name} × {i.quantity} — {formatSDG(i.product.price * i.quantity)}</li>
            ))}
          </ul>
        )}
        <p className="mt-3 font-semibold">الإجمالي: {formatSDG(total)}</p>
      </div>

      <button className="btn-secondary" onClick={sendWhatsApp}>إرسال الطلب إلى واتساب</button>
      <p className="text-slate-600 mt-2">بعد الإرسال، سيُفتح واتساب لتأكيدك على الرسالة.</p>
    </section>
  );
}

function labelFor(m: PaymentMethod) {
  switch (m) {
    case "cash": return "نقدًا عند الاستلام";
    case "bankak": return "بنكك";
    case "fawry": return "فوري";
    case "mykashi": return "ماي كاشي";
    case "okash": return "أوكاش";
  }
}
