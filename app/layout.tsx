import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { TranslationProvider } from "@/lib/i18n/useTranslation";
import { getLocaleFromCookies } from "@/lib/i18n";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Read locale from cookies so server and client match
  const cookieStore = await cookies();
  const localeFromCookie = cookieStore.get("app_locale")?.value;
  const locale = getLocaleFromCookies(localeFromCookie);

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TranslationProvider initialLocale={locale}>
          {children}
        </TranslationProvider>
      </body>
    </html>
  );
}
