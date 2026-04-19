import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: ['/', '/pages/'],
                disallow: ['/clinic/', '/auth/'],
            },
        ],
        sitemap: `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://nuvet.app'}/sitemap.xml`,
    };
}
