import type { Metadata } from "next";
import { Poppins, Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
import { getPublicWebBaseUrl } from "@/lib/publicBoards";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getPublicWebBaseUrl()),
  title: "Notemarq - Capture Ideas",
  description: "Transform your thoughts into organized notes and ideas",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/favicon.ico",
  },
};

const beforeInteractiveScript = `
(function () {
  try {
    var key = 'notemarq-web-theme';
    var stored = localStorage.getItem(key);
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = stored === 'dark' || stored === 'light' ? stored : (prefersDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', theme === 'dark');
  } catch (e) {}

  try {
    var body = document.body;
    if (!body) return;
    var style = body.getAttribute('style');
    if (style === '' || style === null && body.style && body.style.length === 0) {
      body.removeAttribute('style');
    }
    body.removeAttribute('cz-shortcut-listen');
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} ${jakarta.variable}`} suppressHydrationWarning>
      <body className="font-poppins antialiased" suppressHydrationWarning>
        <Script id="notemarq-before-interactive" strategy="beforeInteractive">
          {beforeInteractiveScript}
        </Script>
        <div id="notemarq-root">{children}</div>
      </body>
    </html>
  );
}
