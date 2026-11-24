import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";

import { getSettings } from "@/lib/settings";

import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const sora = Sora({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-sora",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    title: {
      default: `${settings.businessName} | Friendly IT help in Perth`,
      template: `%s | ${settings.businessName}`,
    },
    description: settings.tagline,
    applicationName: settings.businessName,
    icons: {
      icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    },
    openGraph: {
      type: "website",
      locale: "en_AU",
      siteName: settings.businessName,
      title: `${settings.businessName} — ${settings.tagline}`,
      description:
        "Computer repairs, IT support, virus removal and data recovery across the Perth metro — onsite, remote or workshop.",
      images: [{ url: "/logo.svg", width: 96, height: 96, alt: `${settings.businessName} logo` }],
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AU" className={`${inter.variable} ${sora.variable}`}>
      <body>{children}</body>
    </html>
  );
}
