import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/blog/en' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().optional(),
    tags: z.array(z.string()).default([]),
    author: z.string().default('Sekoya Team'),
    draft: z.boolean().default(false),
  }),
});

const services = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/services/en' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    icon: z.string(),
    order: z.number(),
    features: z.array(z.string()).default([]),
  }),
});

const portfolio = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/portfolio/en' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    heroImage: z.string().optional(),
    techStack: z.array(z.string()),
    client: z.string().optional(),
    year: z.number(),
    url: z.string().url().optional(),
    featured: z.boolean().default(false),
  }),
});

const testimonials = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/testimonials/en' }),
  schema: z.object({
    quote: z.string(),
    author: z.string(),
    company: z.string(),
    avatar: z.string().optional(),
    order: z.number(),
  }),
});

export const collections = { blog, services, portfolio, testimonials };
