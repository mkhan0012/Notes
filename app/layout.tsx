import type { Metadata } from "next";
// 1. Import 'Architects_Daughter'
import { Inter, Architects_Daughter } from "next/font/google"; 
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// 2. Configure it
const architectsDaughter = Architects_Daughter({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-hand", // Keep the same variable name
});

export const metadata: Metadata = {
  title: "MindScribe",
  description: "AI Note Taking App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* 3. Add variable to body */}
      <body className={`${inter.className} ${architectsDaughter.variable} bg-black text-zinc-100`}>
        {children}
      </body>
    </html>
  );
}