import { Source_Code_Pro } from "next/font/google";
import "./globals.css";

const codeFont = Source_Code_Pro({
  subsets: ["latin"],
  variable: "--font-code",
  display: "swap",
  // Include different weights you might need
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata = {
  title: "MPROKOLO",
  description: "Documentation and Library",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${codeFont.variable} font-code antialiased bg-black`}>
        {children}
      </body>
    </html>
  );
}