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

export function professionalServiceJsonLd() {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': `${SITE.url}/#organization`,
    name: SITE.fullName,
    alternateName: SITE.name,
    url: SITE.url,
    logo: `${SITE.url}/favicon.svg`,
    email: SITE.email,
    telephone: SITE.phone,
    foundingDate: `${SITE.foundedYear}`,
    description: SITE.description,
    areaServed: {
      '@type': 'GeoShape',
      name: 'Worldwide',
    },
    knowsAbout: [
      'Software Development',
      'Mobile App Development',
      'Web Development',
      'Internet of Things (IoT)',
      'Machine Learning',
      'Artificial Intelligence',
      'DevOps',
      'Cloud Computing',
      'Flutter',
      'React',
      'Node.js',
      'Python',
      'AWS',
      'Azure',
      'Google Cloud',
      'Docker',
      'Kubernetes',
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Software Development Services',
      itemListElement: [
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Mobile & Web Application Development' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Custom App Development' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Software Consultancy' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Project Management' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'IoT Solutions' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Machine Learning' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Artificial Intelligence' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'DevOps & Cloud Services' } },
      ],
    },
    sameAs: [SOCIAL.linkedin, SOCIAL.github, SOCIAL.facebook, SOCIAL.instagram],
  });
}

export function faqPageJsonLd(faqs: { question: string; answer: string }[]) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  });
}

export function toolPageJsonLd(tool: {
  name: string;
  description: string;
  url: string;
}) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: tool.name,
    description: tool.description,
    url: `${SITE.url}${tool.url}`,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    provider: {
      '@type': 'Organization',
      name: SITE.fullName,
      url: SITE.url,
    },
  });
}
