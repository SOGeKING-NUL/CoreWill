import "./globals.css";
import Providers from "@/components/provider";
export const metadata = {
    title: "CoreWill",
    description: "Wallet inheritance made simple",
};
export default function RootLayout({ children, }) {
    return (<html lang="en">
      <Providers>
        <body>
          {children}
        </body>
      </Providers>
    </html>);
}
