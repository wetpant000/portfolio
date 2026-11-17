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

export const metadata: Metadata = {
  title: "K Vijay Kumar Swamy — Portfolio",
  description: "Data Science undergrad and software developer building ML & AI projects.",
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
