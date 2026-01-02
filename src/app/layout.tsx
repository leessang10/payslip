import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteTitle = "대한민국 급여명세서 PDF 생성기";
const siteDescription =
  "임금근로자/프리랜서 급여명세서를 입력하고 PDF로 다운로드하세요.";
const siteUrl = "https://payslip-green.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: "%s | 급여명세서",
  },
  description: siteDescription,
  applicationName: siteTitle,
  alternates: {
    canonical: "/",
  },
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
    url: "/",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: siteTitle,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: ["/opengraph-image"],
  },
  verification: {
    google: "YRl2-gVXdzhAnmcV0xxg_cFht74gt1LVO-V_JZKmcHI",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: siteTitle,
    description: siteDescription,
    url: siteUrl,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    publisher: {
      "@type": "Organization",
      name: "상무스튜디오",
    },
  };

  return (
    <html lang="ko">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
