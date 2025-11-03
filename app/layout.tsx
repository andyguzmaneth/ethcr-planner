import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TranslationProvider } from "@/lib/i18n/useTranslation";
import { getLocale } from "@/lib/i18n";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ETHCR Planner",
  description: "Planificación de eventos y gestión de proyectos para Ethereum Costa Rica",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Use default locale from env or fallback to "es"
  // The client-side TranslationProvider will handle actual locale switching
  const defaultLocale = (process.env.NEXT_PUBLIC_DEFAULT_LOCALE as "en" | "es" | "ko") || "es";

  return (
    <html lang={defaultLocale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TranslationProvider initialLocale={defaultLocale}>
          {children}
        </TranslationProvider>
      </body>
    </html>
  );
}
