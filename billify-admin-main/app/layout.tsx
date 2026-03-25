import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import LayoutClient from "./LayoutClient";
import { AdminThemeProvider } from "./components/admin/AdminThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Billify Admin Dashboard",
  description: "Admin dashboard for Billify self-checkout system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} bg-[var(--app-bg)] font-sans text-[var(--app-text)] antialiased`}
      >
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var storedTheme = localStorage.getItem('billify-admin-theme');
                var systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                var theme = storedTheme || systemTheme;
                document.documentElement.classList.toggle('dark', theme === 'dark');
                document.documentElement.setAttribute('data-theme', theme);
                document.body.style.colorScheme = theme;
              } catch (error) {
                document.documentElement.classList.remove('dark');
                document.documentElement.setAttribute('data-theme', 'light');
                document.body.style.colorScheme = 'light';
              }
            `,
          }}
        />
        <AdminThemeProvider>
          <LayoutClient>{children}</LayoutClient>
        </AdminThemeProvider>
      </body>
    </html>
  );
}
