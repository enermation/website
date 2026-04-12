'use client'

import { Component, type ErrorInfo, type ReactNode } from 'react'
import { heroCategories } from '@/lib/data'

type Props = {
  fallback?: ReactNode
  children: ReactNode
}

type State = {
  hasError: boolean
  error: Error | null
}

export class HeroErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // biome-ignore lint/suspicious/noConsole: Error logging for production monitoring
    console.error('[HeroErrorBoundary]', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? <HeroStaticFallback />
    }

    return this.props.children
  }
}

function HeroStaticFallback() {
  const active = heroCategories[0]

  return (
    <section
      aria-label="Product showcase"
      className="relative min-h-screen bg-surface-dark flex items-center justify-center"
    >
      <div className="text-center px-4">
        <h1 className="font-display font-normal text-section uppercase tracking-widest text-on-dark mb-6">
          {active.label}
        </h1>
        <p className="font-body text-15 text-on-dark-muted mb-8 max-w-md mx-auto">
          Interactive 3D viewer is unavailable. Please browse our collection directly.
        </p>
        <a
          href={active.href}
          className="inline-flex items-center justify-center rounded-none border-2 border-on-dark bg-transparent px-10 py-3 font-heading font-semibold text-13 uppercase tracking-wider text-on-dark transition-colors duration-200 hover:bg-on-dark hover:text-surface-dark"
        >
          Browse {active.label}
        </a>
      </div>
    </section>
  )
}
