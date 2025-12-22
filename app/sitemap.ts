import { getBlogPosts } from './blog/utils';

export const baseUrl = 'https://conordeegan.dev';

export default async function sitemap() {
    const blogs = getBlogPosts().map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: post.metadata.publishedAt,
    }));

    const routes = [''].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date().toISOString().split('T')[0],
    }));

    return [...routes, ...blogs];
}
