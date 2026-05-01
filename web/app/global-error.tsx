'use client'

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-6 text-center px-6">
          <div>
            <p className="font-heading text-13 uppercase tracking-widest text-muted-foreground">
              Something went wrong
            </p>
            <h1 className="mt-2 font-display text-4xl text-heading">Unable to load page</h1>
          </div>
          <p className="max-w-md font-body text-body text-muted-foreground">
            We encountered an unexpected error. Please try refreshing the page.
          </p>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center rounded-none border-2 border-strong bg-background px-8 py-3 font-heading text-13 font-semibold uppercase tracking-wider text-foreground transition-colors duration-200 hover:bg-foreground hover:text-background"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
