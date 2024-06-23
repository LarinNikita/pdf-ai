import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import { cn } from '@/lib/utils'

import Providers from '@/providers'

import './globals.css'

import Navbar from '@/components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'IRIS',
    description: 'Assistant in working with PDF documents',
    icons: {
        icon: '/logo.png',
    },
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
                    <Navbar />
                    {children}
                </body>
            </Providers>
        </html>
    )
}
