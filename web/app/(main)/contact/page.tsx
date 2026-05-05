import { Suspense } from 'react'
import { SiteHeader } from '@/components/site-header'

export default function ContactPage() {
  return (
    <>
      <Suspense fallback={null}>
        <SiteHeader />
      </Suspense>
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-site px-4 py-20 md:px-6">
          <h1 className="font-display text-section text-heading text-center">Contact Us</h1>
          <p className="text-body text-muted-foreground text-center mt-4">
            Contact page coming soon.
          </p>
        </div>
      </main>
    </>
  )
}
