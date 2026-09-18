import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Test Your Taste",
  description:
    "Read a real research paper, then guess its journal and citation impact.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}
