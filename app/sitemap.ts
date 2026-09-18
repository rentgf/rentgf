import type { MetadataRoute } from 'next'
export default function sitemap(): MetadataRoute.Sitemap { return ['/', '/discover', '/safety', '/login', '/register', '/terms', '/privacy', '/support'].map((path) => ({ url: `https://rentgf.example${path}`, lastModified: new Date() })) }
