import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import Header from "@/components/header";
import { light } from "@clerk/themes";  
import { ThemeProvider } from "@/components/theme-provider";
import { FloatingButtons } from "@/components/floating-buttons";
import Footer from "@/components/footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Hospital Button, Hospital Management Application",
  description: "Connect with doctors anytime, anywhere",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: light,
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="icon" href="/logo.png" sizes="any" />
        </head>
        <body className={`${inter.className}`} suppressHydrationWarning>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <Header />
            <main className="min-h-screen pt-16">{children}</main>
            <FloatingButtons />
            <Toaster richColors />
            <Footer/>

          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
