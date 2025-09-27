import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LoadingProvider } from "@/contexts/LoadingContext";
import { Toaster } from "react-hot-toast";
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ORIPRO - Sistem Informasi Manajemen Aset Perusahaan",
  description: "ORIPRO - Sistem Informasi Manajemen Aset Perusahaan",
  // metadataBase: new URL("https://oripro-nextjs-typescript-shadcn-5fu5.vercel.app"),
  openGraph: {
    title: "ORIPRO - Sistem Informasi Manajemen Aset Perusahaan",
    description: "Sistem Informasi Manajemen Aset Perusahaan",
    // url: "https://wowdash-nextjs-typescript-shadcn-5fu5.vercel.app",
    siteName: "ORIPRO",
    images: [
      {
        url: "https://wowdash-nextjs-typescript-shadcn-5fu5.vercel.app/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "ORIPRO Dashboard Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ORIPRO - Sistem Informasi Manajemen Aset Perusahaan",
    description: "Sistem Informasi Manajemen Aset Perusahaan",
    images: ["https://oripro-nextjs-typescript-shadcn-5fu5.vercel.app/og-image.jpg"],
  },
};


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <LoadingProvider>
          {children}
        </LoadingProvider>
        <Toaster
          position="top-right"
          limit={1}
          gutter={8}
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#4ade80',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
