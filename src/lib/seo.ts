import { SITE, SOCIAL } from './constants';

interface MetaProps {
  title: string;
  description: string;
  image?: string;
  canonicalURL?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
}

export function generateMeta(props: MetaProps) {
  const { title, description, image, canonicalURL, type = 'website' } = props;
  const ogImage = image || '/og-default.png';

  return {
    title: `${title} | ${SITE.name}`,
    description,
    ogImage,
    canonicalURL,
    type,
    publishedTime: props.publishedTime,
    modifiedTime: props.modifiedTime,
  };
}

export function organizationJsonLd() {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE.fullName,
    alternateName: SITE.name,
    url: SITE.url,
    logo: `${SITE.url}/favicon.svg`,
    email: SITE.email,
    telephone: SITE.phone,
    foundingDate: `${SITE.foundedYear}`,
    sameAs: [SOCIAL.linkedin, SOCIAL.github, SOCIAL.facebook, SOCIAL.instagram],
  });
}

export function websiteJsonLd() {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE.name,
    url: SITE.url,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE.url}/blog/?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  });
}

export function breadcrumbJsonLd(items: { name: string; href: string }[]) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE.url}${item.href}`,
    })),
  });
}

export function blogPostingJsonLd(post: {
  title: string;
  description: string;
  url: string;
  pubDate: Date;
  updatedDate?: Date;
  author?: string;
  image?: string;
}) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    url: `${SITE.url}${post.url}`,
    datePublished: post.pubDate.toISOString(),
    dateModified: (post.updatedDate || post.pubDate).toISOString(),
    author: {
      '@type': 'Person',
      name: post.author || SITE.name,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE.name,
      url: SITE.url,
    },
    image: post.image ? `${SITE.url}${post.image}` : `${SITE.url}/og-default.png`,
  });
}

export function serviceJsonLd(service: {
  title: string;
  description: string;
  url: string;
}) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.title,
    description: service.description,
    url: `${SITE.url}${service.url}`,
    provider: {
      '@type': 'Organization',
      name: SITE.fullName,
      url: SITE.url,
    },
  });
}

export function personJsonLd(person: {
  name: string;
  role: string;
  url?: string;
}) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: person.name,
    jobTitle: person.role,
    worksFor: {
      '@type': 'Organization',
      name: SITE.fullName,
    },
    url: person.url,
  });
}
