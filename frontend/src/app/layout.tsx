import type { Metadata } from "next";
import HolyLoader from "holy-loader";
import { Inter as FontSans } from "next/font/google";
import "./globals.css";

import { cn } from "@/lib/utils";
import { BrowserStoreProvider } from "@/stores/BrowserStore";
import { DbStoreProvider } from "@/stores/DbStore";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Organator",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <DbStoreProvider>
      <BrowserStoreProvider>
        <html lang="en">
          {/* https://github.com/tomcru/holy-loader/issues/2 */}
          <HolyLoader height={2} color="#738c7b" />
          <body
            className={cn(
              "min-h-screen bg-background font-sans antialiased",
              fontSans.variable
            )}
          >
            {children}
          </body>
        </html>
      </BrowserStoreProvider>
    </DbStoreProvider>
  );
}
