export const SITE = {
  name: 'Sekoya',
  fullName: 'Sekoya Group Information and Technology',
  shortName: 'Sekoya',
  url: 'https://sekoya.tech',
  email: 'info@sekoya.tech',
  phone: '+90 507 743 83 21',
  foundedYear: 2024,
  description: 'We accompany you on your digital journey. Custom software development, mobile applications, AI, IoT, and cloud solutions.',
} as const;

export const SOCIAL = {
  linkedin: 'https://www.linkedin.com/company/sekoya-tech',
  github: 'https://github.com/sekoyatech',
  facebook: 'https://facebook.com/sekoya.tech',
  instagram: 'https://instagram.com/sekoya.tech',
} as const;

export const NAV_ITEMS = [
  { label: 'nav.home', href: '/' },
  { label: 'nav.about', href: '/about/' },
  { label: 'nav.services', href: '/services/' },
  { label: 'nav.portfolio', href: '/portfolio/' },
  { label: 'nav.blog', href: '/blog/' },
  { label: 'nav.team', href: '/team/' },
  { label: 'nav.careers', href: '/careers/' },
  { label: 'nav.contact', href: '/contact/' },
] as const;

export const FOOTER_NAV = {
  company: [
    { label: 'nav.about', href: '/about/' },
    { label: 'nav.team', href: '/team/' },
    { label: 'nav.careers', href: '/careers/' },
    { label: 'nav.contact', href: '/contact/' },
  ],
  services: [
    { label: 'services.mobile_web', href: '/services/mobile-web-development/' },
    { label: 'services.custom_app', href: '/services/custom-app-development/' },
    { label: 'services.ai', href: '/services/artificial-intelligence/' },
    { label: 'services.devops', href: '/services/devops-cloud/' },
  ],
  resources: [
    { label: 'nav.blog', href: '/blog/' },
    { label: 'nav.portfolio', href: '/portfolio/' },
    { label: 'footer.privacy', href: '/privacy-policy/' },
  ],
} as const;

export const WEB3FORMS_KEY = import.meta.env.PUBLIC_WEB3FORMS_KEY || '';

export const PLAUSIBLE_DOMAIN = 'sekoya.tech';

export const GISCUS = {
  repo: 'sekoyatech/sekoyatech.github.io',
  repoId: 'R_kgDORnIRIA',
  category: 'General',
  categoryId: 'DIC_kwDORnIRIM4C4d4b',
} as const;

export const BLOG = {
  postsPerPage: 6,
} as const;
