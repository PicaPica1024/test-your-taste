import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Test Your Taste",
  description:
    "只看年份、标题和摘要，猜真实论文的期刊或会议与引用量。",
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
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}
