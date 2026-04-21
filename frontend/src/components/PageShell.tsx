import type { ReactNode } from 'react'

type PageShellProps = {
  eyebrow: string
  title: string
  description: string
  children: ReactNode
}

export function PageShell({ eyebrow, title, description, children }: PageShellProps) {
  return (
    <main className="app-shell">
      <section className="card auth-card">
        <div className="hero-copy">
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p className="supporting-text">{description}</p>
        </div>
        {children}
      </section>
    </main>
  )
}
