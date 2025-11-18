// app/layout.tsx
import "./globals.css";
import type { ReactNode } from "react";
import ClientProviders from "./_components/clientProviders";

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
