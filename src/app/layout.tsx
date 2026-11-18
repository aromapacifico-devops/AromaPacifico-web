import type { Metadata, Viewport } from "next";
import { site } from "@/content/site";
import "./globals.css";

const publicUrl = process.env.NEXT_PUBLIC_SITE_URL;
const socialImage = publicUrl
  ? "/screenshots/home-desktop.png"
  : "https://raw.githubusercontent.com/aromapacifico-devops/aromapacifico-devops-docs/main/docs/architecture/diagrams/assets/brand-logo.png";

export const metadata: Metadata = {
  metadataBase: publicUrl ? new URL(publicUrl) : undefined,
  title: {
    default: site.title,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  category: "technology",
  keywords: ["AromaPacífico", "café", "trazabilidad", "arquitectura", "Colombia", "proyecto académico"],
  authors: [{ name: "AromaPacífico", url: site.webRepository }],
  creator: "AromaPacífico",
  openGraph: {
    title: site.title,
    description: site.description,
    type: "website",
    locale: "es_CO",
    siteName: site.name,
    images: [{ url: socialImage, width: publicUrl ? 1440 : 610, height: publicUrl ? 900 : 180, alt: "Aroma Pacífico" }],
  },
  twitter: { card: "summary_large_image", title: site.title, description: site.description, images: [socialImage] },
  icons: { icon: "/brand/aroma-pacifico-logo.png" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#161412",
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es-CO"><body>{children}</body></html>;
}
