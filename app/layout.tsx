import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import { cn } from '@/lib/utils'

import './globals.css'

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
            <body
                className={cn(
                    'grainy min-h-screen font-sans antialiased',
                    inter.className,
                )}
            >
                {children}
            </body>
        </html>
    )
}
