import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "متجر عربي",
  description: "متجر إلكتروني عربي للسودان"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar">
      <body>
        <CartProvider>
          <Navbar />
          <main className="container py-6">{children}</main>
        </CartProvider>
      </body>
    </html>
  );
}
