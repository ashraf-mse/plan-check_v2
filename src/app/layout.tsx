import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
});

export const metadata: Metadata = {
    title: "PlanCheck · PostgreSQL Performance Analysis",
    description: "Analyze PostgreSQL execution plans with precision. Identify bottlenecks, optimize queries, and improve database performance.",
    keywords: ["postgresql", "explain", "analyze", "database", "performance", "query optimization"],
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="h-full">
            <body className={`${inter.variable} font-sans antialiased h-full bg-gradient-to-br from-gray-50 via-white to-blue-50/30 text-gray-900`}>
                {children}
            </body>
        </html>
    );
}
