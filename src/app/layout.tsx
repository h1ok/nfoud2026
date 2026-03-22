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
  keywords: ["نفود", "أخبار السعودية", "أخبار سعودية", "ذكاء اصطناعي", "أخبار عربية", "سياسة", "اقتصاد", "رياضة", "أخبار عاجلة", "تغطية حية", "nfoud", "أخبار المملكة", "أخبار محلية", "أخبار عالمية", "تحليلات سياسية", "تقارير اقتصادية"],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  applicationName: SITE_NAME,
  category: 'news',
  classification: 'News & Media',
  alternates: {
    canonical: SITE_URL,
    languages: {
      'ar-SA': SITE_URL,
      'ar': SITE_URL,
    },
    types: {
      'application/rss+xml': `${SITE_URL}/rss.xml`,
      'application/atom+xml': `${SITE_URL}/rss.xml`,
    },
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  verification: {
    google: 'google-site-verification-code',
  },
  openGraph: {
    type: "website",
    locale: "ar_SA",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} - أول شبكة أخبار سعودية بالذكاء الاصطناعي`,
    description: SITE_DESCRIPTION,
    images: [{
      url: `${SITE_URL}/nafud-logo.png`,
      width: 512,
      height: 512,
      alt: SITE_NAME,
    }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@Nfoud_ai",
    creator: "@Nfoud_ai",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [`${SITE_URL}/nafud-logo.png`],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: '/nafud-logo.png',
    shortcut: '/favicon.ico',
    apple: '/nafud-logo.png',
  },
  manifest: '/manifest.json',
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "NewsMediaOrganization",
  "name": SITE_NAME,
  "url": SITE_URL,
  "logo": {
    "@type": "ImageObject",
    "url": `${SITE_URL}/nafud-logo.png`,
    "width": 512,
    "height": 512,
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
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "availableLanguage": ["Arabic", "English"],
  },
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
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": `${SITE_URL}/search?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
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
        <link rel="preconnect" href="https://vraxaknyauqlnyardhla.supabase.co" />
        <link rel="dns-prefetch" href="https://vraxaknyauqlnyardhla.supabase.co" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" href="/nafud-logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/nafud-logo.png" />
        <meta name="theme-color" content="#1a2332" />
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
