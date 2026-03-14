import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE } from '../lib/constants';

export async function GET(context: any) {
  const posts = (await getCollection('blog')).filter((post) => !post.data.draft);
  return rss({
    title: `${SITE.name} Blog`,
    description: SITE.description,
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/blog/${post.id}/`,
    })),
  });
}
