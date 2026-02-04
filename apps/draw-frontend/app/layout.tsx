import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Studio Canvas - Draw, Collaborate, Create",
  description:
    "A digital canvas that feels like paper, designed for teams who sketch their way to solutions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
