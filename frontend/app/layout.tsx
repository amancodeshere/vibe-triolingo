import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/components/providers/AuthProvider'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
})

export const metadata: Metadata = {
  title: 'Vibe Triolingo - Learn Languages with Fun',
  description: 'Master new languages through interactive lessons, gamified learning, and personalized progress tracking. Start your language journey today!',
  keywords: 'language learning, duolingo clone, spanish, french, german, italian, portuguese, education, gamification',
  authors: [{ name: 'Vibe Triolingo Team' }],
  creator: 'Vibe Triolingo',
  openGraph: {
    title: 'Vibe Triolingo - Learn Languages with Fun',
    description: 'Master new languages through interactive lessons, gamified learning, and personalized progress tracking.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vibe Triolingo - Learn Languages with Fun',
    description: 'Master new languages through interactive lessons, gamified learning, and personalized progress tracking.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className="font-sans antialiased bg-gradient-to-br from-primary-50 to-secondary-50 min-h-screen">
        <AuthProvider>
          {children}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  )
}
