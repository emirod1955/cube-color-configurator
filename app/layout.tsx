import { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "SantaJusta Lovemade",
  description: "Figuras familiares artesanales en madera. Diseñá tu regalo único.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
