import { Outfit } from 'next/font/google'
import './globals.css'

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap'
})

export const metadata = {
  title: 'Constructivist Portfolio — Binary Modernism',
  description:
    'A Constructivist design portfolio utilizing a 3D tilted stage, rigid geometric constraints, and primary colors — a modern digital interpretation of 1920s Bauhaus poster art.'
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
