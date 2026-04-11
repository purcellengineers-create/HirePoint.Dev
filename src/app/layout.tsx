import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HirePoint - Find Your Next Opportunity",
  description:
    "Browse thousands of job listings, apply with one click, and track your applications.",
};

const stripExtensionAttrs = `
(function(){
  document.querySelectorAll('[data-cursor-ref]').forEach(function(el){el.removeAttribute('data-cursor-ref')});
  new MutationObserver(function(muts){
    for(var i=0;i<muts.length;i++){
      var m=muts[i];
      if(m.type==='attributes'&&m.attributeName&&m.attributeName.startsWith('data-cursor-'))m.target.removeAttribute(m.attributeName);
      if(m.type==='childList')m.addedNodes.forEach(function(n){if(n.removeAttribute){n.querySelectorAll&&n.querySelectorAll('[data-cursor-ref]').forEach(function(el){el.removeAttribute('data-cursor-ref')})}});
    }
  }).observe(document.documentElement,{attributes:true,attributeFilter:['data-cursor-ref'],childList:true,subtree:true});
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {process.env.NODE_ENV === "development" && (
          <script dangerouslySetInnerHTML={{ __html: stripExtensionAttrs }} />
        )}
      </head>
      <body suppressHydrationWarning className="min-h-full flex flex-col">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
