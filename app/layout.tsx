import type { Metadata } from "next";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "ShowForge",
    template: "%s · ShowForge",
  },
  description: "Ubah screenshots menjadi showreel portfolio.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // The init script adds "light" or "dark" to <html> before React hydrates.
    <html lang="id" className="h-full" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
