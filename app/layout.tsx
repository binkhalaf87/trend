import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  display: "swap",
  variable: "--font-cairo",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "TrendZone | اكتشف الترندات قبل المنافسين",
    template: "%s | TrendZone",
  },
  description:
    "منصة SaaS لاكتشاف الترندات التجارية مبكراً وتوليد محتوى عربي جاهز للنشر على متجرك الإلكتروني",
  keywords: ["ترندات", "متجر إلكتروني", "محتوى عربي", "تسويق", "SaaS"],
  authors: [{ name: "TrendZone" }],
  creator: "TrendZone",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ),
  openGraph: {
    type: "website",
    locale: "ar_SA",
    title: "TrendZone | اكتشف الترندات قبل المنافسين",
    description: "منصة SaaS لاكتشاف الترندات التجارية مبكراً",
    siteName: "TrendZone",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={cairo.variable}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
