import type { Metadata } from "next";
import "../styles/globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import NavBar from "@/components/globals/navbar";
import { ClerkProvider } from "@clerk/nextjs";
import localFont from "next/font/local";
import { Toaster } from "@/components/ui/toaster";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "@/app/api/uploadthing/core";
import { Footer } from "@/components/globals/footer";
const poppins = localFont({
  src: [
    {
      path: "./fonts/Poppins-Bold.woff",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/Poppins-Medium.woff",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/Poppins-Regular.woff",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/Poppins-SemiBold.woff",
      weight: "600",
      style: "normal",
    },
  ],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "MarketHive",
  description: "MarketHive a E-Commerce Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${poppins.variable} antialiased`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <NavBar />
            <NextSSRPlugin
              /**
               * The `extractRouterConfig` will extract **only** the route configs
               * from the router to prevent additional information from being
               * leaked to the client. The data passed to the client is the same
               * as if you were to fetch `/api/uploadthing` directly.
               */
              routerConfig={extractRouterConfig(ourFileRouter)}
            />
            {children}
            <Footer />
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
