import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s · LeakLens AI · PayPal × AG Grid",
    default: "LeakLens AI · PayPal × AG Grid",
  },
  description: "Autonomous Revenue Leak Investigator for PayPal Merchants (PayPal × AG Grid)",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased font-sans">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
