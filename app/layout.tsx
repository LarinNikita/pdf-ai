import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import 'simplebar-react/dist/simplebar.min.css'

import { cn } from '@/lib/utils'

import Providers from '@/providers'

import './globals.css'

import Navbar from '@/components/Navbar'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'IRIS',
    description: 'Assistant in working with PDF documents',
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en">
            <Providers>
                <body
                    className={cn(
                        'grainy min-h-screen font-sans antialiased',
                        inter.className,
                    )}
                >
                    <Toaster />
                    <Navbar />
                    {children}
                </body>
            </Providers>
        </html>
    )
}
