import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Inter } from "next/font/google"
import "./globals.css"
import { ClerkProvider } from "@clerk/nextjs"
import { EngagementProvider } from "@/components/engagement-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Avolink",
  description: "A web3 based event conduction platform",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

  if (!publishableKey) {
    throw new Error('Missing Clerk Publishable Key')
  }

  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body className={`${inter.className} min-h-screen bg-[#0A0A0F] text-white antialiased`}>
        <ClerkProvider 
          publishableKey={publishableKey}
          appearance={{
            baseTheme: undefined,
            variables: {
              colorPrimary: '#E84142',
              colorText: '#ffffff',
              colorTextSecondary: '#a1a1aa',
              colorBackground: '#0A0A0F',
              colorInputBackground: '#1f1f23',
              colorInputText: '#ffffff',
              borderRadius: '0.75rem',
            },
            elements: {
              formButtonPrimary: {
                backgroundColor: '#E84142',
                '&:hover': {
                  backgroundColor: '#d73738',
                },
              },
              card: {
                backgroundColor: '#1a1a1e',
                border: '1px solid #27272a',
              },
              headerTitle: {
                color: '#ffffff',
              },
              headerSubtitle: {
                color: '#a1a1aa',
              },
            },
          }}
        >
          <EngagementProvider>{children}</EngagementProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}
