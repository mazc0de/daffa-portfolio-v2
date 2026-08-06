import { Outfit } from 'next/font/google'
import './globals.css'

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap'
})

import type { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL('https://daffah.my.id'),
  title: {
    default: 'Daffa Hanifisyafiq | Frontend Web Developer',
    template: '%s | Daffa Hanifisyafiq'
  },
  description:
    'Daffa Hanifisyafiq — Frontend Developer specializing in React, Next.js, TypeScript, and Tailwind CSS. Building fast, clean, and responsive web apps.',
  keywords: [
    'Daffa Hanifisyafiq',
    'Frontend Developer',
    'Web Developer',
    'React Developer',
    'Next.js',
    'TypeScript',
    'Tailwind CSS',
    'Portfolio',
    'Indonesia'
  ],
  authors: [{ name: 'Daffa Hanifisyafiq' }],
  creator: 'Daffa Hanifisyafiq',
  publisher: 'Daffa Hanifisyafiq',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://daffah.my.id',
    title: 'Daffa Hanifisyafiq | Frontend Web Developer',
    description:
      'Daffa Hanifisyafiq — Frontend Developer specializing in React, Next.js, TypeScript, and Tailwind CSS. Building fast, clean, and responsive web apps.',
    siteName: 'Daffa Hanifisyafiq Portfolio',
    images: [
      {
        url: '/headshot.webp',
        width: 1200,
        height: 630,
        alt: 'Daffa Hanifisyafiq - Frontend Web Developer'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Daffa Hanifisyafiq | Frontend Web Developer',
    description:
      'Daffa Hanifisyafiq — Frontend Developer specializing in React, Next.js, TypeScript, and Tailwind CSS. Building fast, clean, and responsive web apps.',
    images: ['/headshot.webp']
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  },
  alternates: {
    canonical: 'https://daffah.my.id'
  }
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body
        className={`${outfit.variable} grain-overlay`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  )
}
