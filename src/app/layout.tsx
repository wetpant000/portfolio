import type { Metadata } from "next";
import { Geist, Geist_Mono, Press_Start_2P } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const pixel = Press_Start_2P({
  variable: "--font-press-start",
  weight: "400",
  subsets: ["latin"],
});

const SITE_URL = "https://kvijaykumar.vercel.app";
const TITLE = "K Vijay Kumar Swamy — Portfolio";
const DESCRIPTION =
  "Data Science undergrad and software developer. A portfolio you play: ASCII ocean, skill inventory, quest log, bookshelf and a bug-squashing mini-game.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "K Vijay Kumar Swamy",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Set the theme before first paint so there is no flash. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark"){t=matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}document.documentElement.dataset.theme=t}catch(e){}})();`,
          }}
        />
        {/* Without JS, show content that would otherwise animate in. */}
        <noscript>
          <style>{`.reveal{opacity:1!important;transform:none!important}.xp-fill{width:var(--w)!important}`}</style>
        </noscript>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} ${pixel.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
