import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteTitle = "대한한국 급여명세서 PDF 생성기";
const siteDescription =
  "임금근로자/프리랜서 급여명세서를 입력하고 PDF로 다운로드하세요.";

export const metadata: Metadata = {
  title: {
    default: siteTitle,
    template: "%s | 급여명세서",
  },
  description: siteDescription,
  applicationName: siteTitle,
  keywords: [
    "급여명세서",
    "급여명세서 PDF",
    "임금근로자",
    "프리랜서",
    "급여 계산",
    "원천징수",
    "세금 계산",
    "한국 급여",
  ],
  authors: [{ name: "상무스튜디오" }],
  creator: "상무스튜디오",
  publisher: "상무스튜디오",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    locale: "ko_KR",
    type: "website",
    siteName: siteTitle,
  },
  twitter: {
    card: "summary",
    title: siteTitle,
    description: siteDescription,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
