import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo'

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: { path: string; priority: number; changeFrequency: 'weekly' | 'monthly' | 'yearly' }[] = [
    { path: '',          priority: 1.0, changeFrequency: 'weekly' },
    { path: '/register', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/login',    priority: 0.5, changeFrequency: 'yearly' },
    { path: '/privacy',  priority: 0.3, changeFrequency: 'yearly' },
    { path: '/terms',    priority: 0.3, changeFrequency: 'yearly' },
  ]
  return pages.map(({ path, priority, changeFrequency }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }))
}
