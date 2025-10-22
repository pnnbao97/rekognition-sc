// app/layout.tsx
import { ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Providers } from "./providers";
import "./globals.css"; // Thêm dòng này nếu bạn có global CSS

export const metadata = {
  title: "Rekognition-SC",
  description: "Một ứng dụng đơn giản bằng Lambda và API Gateway",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Toaster />
          <Sonner />
          {children}
        </Providers>
      </body>
    </html>
  );
}