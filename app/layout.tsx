import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "오늘도 잘했어요!",
  description: "어린이를 위한 귀여운 일일 체크리스트",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#FFF3E6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Jua&family=Gowun+Dodum&display=swap"
        />
      </head>
      <body className="min-h-full flex flex-col font-body bg-app">{children}</body>
    </html>
  );
}
