import { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "3D Configurator",
  description: "Customize your 3D family figure",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
