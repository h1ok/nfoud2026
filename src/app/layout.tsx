import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from "@/lib/constants";

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
      { url: '/favicon.png', type: 'image/png', sizes: 'any' },
    ],
    apple: { url: '/favicon.png', sizes: '512x512' },
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

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "NewsMediaOrganization",
  "name": SITE_NAME,
  "url": SITE_URL,
  "logo": {
    "@type": "ImageObject",
    "url": `${SITE_URL}/favicon.png`,
  },
  "sameAs": [
    "https://x.com/Nfoud_ai",
    "https://www.instagram.com/nfooud.ai/",
    "https://www.tiktok.com/@nfoud_ai",
  ],
  "description": SITE_DESCRIPTION,
  "foundingDate": "2025",
  "areaServed": {
    "@type": "Country",
    "name": "Saudi Arabia",
  },
  "inLanguage": "ar",
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": SITE_NAME,
  "url": SITE_URL,
  "description": SITE_DESCRIPTION,
  "inLanguage": "ar",
  "publisher": {
    "@type": "NewsMediaOrganization",
    "name": SITE_NAME,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://wqcikbeglxfptnaamnpj.supabase.co" />
        <link rel="dns-prefetch" href="https://wqcikbeglxfptnaamnpj.supabase.co" />
        <meta name="msapplication-TileImage" content="/favicon.png" />
      </head>
      <body className={`${cairo.variable} font-sans antialiased`} suppressHydrationWarning>
        {children}
        <Toaster position="top-center" richColors />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </body>
    </html>
  );
}
