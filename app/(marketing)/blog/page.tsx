import type { Metadata } from 'next'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ArrowRight } from 'lucide-react'
import { getPostsSortedByDate } from '@/lib/blog/posts'
import { SectionHeading } from '@/components/marketing/section-heading'
import { WaitlistForm } from '@/components/marketing/waitlist-form'

export const metadata: Metadata = {
  title: 'Blog · LaPizarra',
  description:
    'Notas, guías y novedades sobre LaPizarra: cómo organizar una liga, qué stats importan, novedades de producto.',
}

export default function BlogIndexPage() {
  const posts = getPostsSortedByDate()

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 md:py-24">
      <p className="text-[11px] uppercase tracking-[0.18em] text-white/30 mb-3">
        Blog
      </p>
      <h1 className="font-display text-4xl md:text-6xl leading-[1.05] mb-3">
        Notas, guías y novedades.
      </h1>
      <p className="text-white/60 text-base md:text-lg mb-12 max-w-2xl">
        Producto, fútbol amateur y un par de opiniones sobre cómo hacer las cosas mejor.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
        {posts.map((p) => {
          const dt = format(new Date(p.publishedAt), 'd MMM yyyy', { locale: es })
          return (
            <Link
              key={p.slug}
              href={`/blog/${p.slug}`}
              className="group bg-card border border-border/30 rounded-2xl p-6 md:p-7 hover:border-accent/30 transition-colors flex flex-col"
            >
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                  {dt}
                </span>
                {p.tags.map((t) => (
                  <span
                    key={t}
                    className="text-[10px] uppercase tracking-[0.2em] bg-white/5 text-white/60 px-2 py-0.5 rounded"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <h2 className="font-display text-2xl leading-tight mb-3">{p.title}</h2>
              <p className="text-sm text-white/60 leading-relaxed flex-1">{p.summary}</p>
              <div className="mt-5 inline-flex items-center gap-1.5 text-accent text-xs uppercase tracking-[0.18em]">
                Leer
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          )
        })}
      </div>

      <section className="bg-card border border-border/30 rounded-2xl p-6 md:p-8 max-w-2xl mx-auto">
        <SectionHeading
          eyebrow="Boletín"
          title="Cada nota nueva, en tu inbox."
          subtitle="Sin spam. Solo cuando hay algo que vale la pena leer."
        />
        <WaitlistForm
          audience="general"
          source="/blog"
          successCopy="Anotado. Te llega cada nota nueva."
        />
      </section>
    </div>
  )
}
