import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import './globals.css'

const outfit = Outfit({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'MailAssert - Email Testing Made Simple',
    template: '%s | MailAssert'
  },
  description: 'The most reliable email testing platform for developers. Get instant disposable inboxes, catch emails in real-time, and validate your email logic with our powerful API. Trusted by 10,000+ developers worldwide.',
  keywords: ['email testing', 'disposable email', 'email validation', 'temporary email', 'email API', 'SMTP testing', 'email debugging', 'developer tools'],
  authors: [{ name: 'MailAssert' }],
  creator: 'MailAssert',
  publisher: 'MailAssert',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'MailAssert - Email Testing Made Simple',
    description: 'The most reliable email testing platform for developers. Get instant disposable inboxes, catch emails in real-time, and validate your email logic with our powerful API.',
    url: '/',
    siteName: 'MailAssert',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'MailAssert - Email Testing Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MailAssert - Email Testing Made Simple',
    description: 'The most reliable email testing platform for developers. Get instant disposable inboxes and validate email logic with our powerful API.',
    images: ['/og-image.png'],
    creator: '@mailassert',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
}

import ToasterClient from '@/components/ToasterClient'
import SessionProviderWrapper from '@/components/SessionProviderWrapper'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={outfit.className}>
        <SessionProviderWrapper>
          <ToasterClient />
          {children}
        </SessionProviderWrapper>
      </body>
    </html>
  )
}
