import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Accounting 記帳小工具",
  description: "使用 React、Next.js 與 Firebase 製作的記帳小工具",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
