import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from "@/lib/constants";
import { siteGraph } from "@/lib/schema";
import { getCategories } from "@/lib/categories";
import CategoryLabelsInit from "@/components/CategoryLabelsInit";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
  preload: true,
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#1a2332",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} - أول شبكة أخبار سعودية بالذكاء الاصطناعي`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: ["نفود", "أخبار السعودية", "أخبار سعودية", "ذكاء اصطناعي", "أخبار عربية", "سياسة", "اقتصاد", "رياضة", "أخبار عاجلة", "تغطية حية", "nfoud"],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: {
    languages: {
      'ar-SA': SITE_URL,
    },
    types: {
      'application/rss+xml': `${SITE_URL}/rss.xml`,
    },
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", type: "image/png" },
      { url: "/favicon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "ar_SA",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} - أول شبكة أخبار سعودية بالذكاء الاصطناعي`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    site: "@Nfoud_ai",
    creator: "@Nfoud_ai",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const categories = await getCategories();

  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://wqcikbeglxfptnaamnpj.supabase.co" />
        <link rel="dns-prefetch" href="https://wqcikbeglxfptnaamnpj.supabase.co" />
        <meta name="msapplication-TileImage" content="/favicon.png" />
      </head>
      <body className={`${cairo.variable} font-sans antialiased`} suppressHydrationWarning>
        <CategoryLabelsInit categories={categories.map((c) => ({ slug: c.slug, name: c.name }))} />
        {children}
        <Toaster position="top-center" richColors />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteGraph()) }}
        />
      </body>
    </html>
  );
}
