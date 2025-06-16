import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/provider";

export const metadata: Metadata = {
  title: "CoreWill",
  description: "Secure Your Digital Legacy Forever",
  twitter: {
    card: "summary_large_image",
    title: "CoreWill -Asset Inheritance on Core DAO",
    description: "Secure Your Digital Legacy Forever",
    images: ["/x_display.png"],
  },
};

export default function RootLayout({children,}: Readonly<{children: React.ReactNode;}>) {
  return (
    <html lang="en">
      <Providers>
        <body>
          {children}
        </body>
      </Providers>
    </html>
  );
}
