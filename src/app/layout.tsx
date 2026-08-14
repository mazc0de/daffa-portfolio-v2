import { Outfit } from 'next/font/google'
import type { Metadata } from 'next'
import { BauhausCursor } from '@/components/BauhausCursor'
import './globals.css'

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap'
})

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
        url: '/images/daffa.webp',
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
    images: ['/images/daffa.webp']
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
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' }
    ],
    apple: [{ url: '/apple-touch-icon.png' }]
  },
  manifest: '/site.webmanifest'
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en' data-scroll-behavior='smooth' suppressHydrationWarning>
      <body
        className={`${outfit.variable} grain-overlay`}
        suppressHydrationWarning
      >
        <BauhausCursor />
        {children}
      </body>
    </html>
  )
}

