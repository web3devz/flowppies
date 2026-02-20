import type { Metadata } from 'next';
import './globals.css';
import { Pixelify_Sans } from "next/font/google";
import { Courier_Prime } from "next/font/google";
import { Press_Start_2P } from "next/font/google";
import { Toaster } from 'react-hot-toast';
import Providers from './providers';

const pressStart2P = Press_Start_2P({ 
  subsets: ["latin"],  
  weight: ["400"],
  variable: "--font-press-start-2p", })

const pixelify = Pixelify_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'], // Specify the weights you need
  display: 'swap',
  variable: '--font-pixelify',
})

const courierPrime = Courier_Prime({
  subsets: ['latin'],
  weight: ['400', '700'], // Specify the weights you need
  display: 'swap',
  variable: '--font-courier-prime',
})

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_PROJECT_NAME,
  description: 'Generated for flow',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body 
      className={`${pixelify.variable} ${courierPrime.variable} ${pressStart2P.variable} antialiased`}>
        <Providers>{children}</Providers>
           <Toaster position="top-center" reverseOrder={false} />
           
      </body>
    </html>
  );
}
