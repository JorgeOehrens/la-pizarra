import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ArrowLeft } from 'lucide-react'
import { getPost, getPostsSortedByDate } from '@/lib/blog/posts'
import { WaitlistForm } from '@/components/marketing/waitlist-form'

type Params = Promise<{ slug: string }>

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) return { title: 'Nota no encontrada · LaPizarra' }

  return {
    title: `${post.title} · LaPizarra`,
    description: post.summary,
  }
}

export function generateStaticParams() {
  return getPostsSortedByDate().map((p) => ({ slug: p.slug }))
}

export default async function BlogPostPage({ params }: { params: Params }) {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) notFound()

  const dt = format(new Date(post.publishedAt), "d 'de' MMMM yyyy", { locale: es })

  // Other posts (newest first, exclude current).
  const others = getPostsSortedByDate()
    .filter((p) => p.slug !== post.slug)
    .slice(0, 2)

  return (
    <article className="max-w-2xl mx-auto px-4 py-12 md:py-16">
      <Link
        href="/blog"
        className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/50 hover:text-white mb-8"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Volver al blog
      </Link>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="text-[10px] uppercase tracking-[0.2em] text-white/40">{dt}</span>
        {post.tags.map((t) => (
          <span
            key={t}
            className="text-[10px] uppercase tracking-[0.2em] bg-white/5 text-white/60 px-2 py-0.5 rounded"
          >
            {t}
          </span>
        ))}
      </div>

      <h1 className="font-display text-3xl md:text-5xl leading-[1.05] mb-3">
        {post.title}
      </h1>
      <p className="text-white/60 text-base md:text-lg leading-relaxed mb-8">
        {post.summary}
      </p>

      <div className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-12">
        Por {post.author}
      </div>

      <div className="prose-marketing space-y-5 text-sm md:text-base text-white/80 leading-relaxed">
        {post.body()}
      </div>

      {/* Newsletter */}
      <section className="mt-16 bg-card border border-border/30 rounded-2xl p-6 md:p-8">
        <p className="text-[10px] uppercase tracking-[0.2em] text-accent mb-2">
          Boletín
        </p>
        <h3 className="font-display text-2xl mb-2">¿Te gustó la nota?</h3>
        <p className="text-sm text-white/60 mb-5">
          Anotate y te mandamos las próximas. Sin spam.
        </p>
        <WaitlistForm
          audience="general"
          source={`/blog/${post.slug}`}
          successCopy="Anotado. Te llega cada nota nueva."
        />
      </section>

      {/* Other posts */}
      {others.length > 0 && (
        <section className="mt-12 border-t border-border/30 pt-10">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-4">
            Seguir leyendo
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {others.map((o) => (
              <Link
                key={o.slug}
                href={`/blog/${o.slug}`}
                className="bg-card border border-border/30 rounded-xl p-4 hover:border-accent/30 transition-colors"
              >
                <p className="font-medium text-sm mb-1">{o.title}</p>
                <p className="text-xs text-white/50 leading-relaxed line-clamp-2">{o.summary}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  )
}
