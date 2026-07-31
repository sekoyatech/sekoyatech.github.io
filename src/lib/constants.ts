/**
 * Legal identifiers of the operating entity. All of these are matters of
 * public record in Turkiye (MERSIS / Ticaret Sicil Gazetesi) and are published
 * here so third parties can independently verify the business.
 *
 * `legalName` is ASCII for the same reason as ADDRESS below. It is deliberately
 * NOT an English translation — the registered name is the registered name, and
 * a translated variant only gives verification teams a third name to reconcile.
 */
export const COMPANY = {
  legalName: 'Sekoya Grup Bilisim ve Teknoloji Ltd. Sti.',
  /** Name the company trades under — distinct from the legal name above. */
  tradeName: 'Sekoya Tech',
  legalForm: 'Limited Sirket (Limited Liability Company)',
  registeredIn: 'Istanbul, Turkiye',
  taxOffice: 'Umraniye',
  taxId: '7591146987',
  mersisNo: '0759114698700001',
  tradeRegistryNo: '1015843',
} as const;

export const SITE = {
  name: 'Sekoya',
  /** Full name of the company: the registered legal name, not a translation. */
  fullName: COMPANY.legalName,
  shortName: 'Sekoya',
  url: 'https://sekoya.tech',
  email: 'info@sekoya.tech',
  phone: '+90 507 743 83 21',
  foundedYear: 2024,
  description: 'We accompany you on your digital journey. Custom software development, mobile applications, AI, IoT, and cloud solutions.',
} as const;

/**
 * Registered office of the company.
 *
 * Deliberately written in ASCII (no Turkish diacritics), because partner and
 * vendor application forms are frequently ASCII-only. Verification teams match
 * the address on the application against the website character for character,
 * and we cannot know which page they will look at — so this transliterated form
 * is the only one used anywhere on the site. Do not reintroduce a
 * Turkish-script variant.
 */
export const ADDRESS = {
  street: 'Inkilap Mah. Hasim Iscan Sok. Kent Sitesi F Blok No: 4/33',
  district: 'Umraniye',
  city: 'Istanbul',
  postalCode: '34768',
  country: 'Turkiye',
  countryCode: 'TR',
} as const;

export const ADDRESS_LOCALITY = [ADDRESS.postalCode, ADDRESS.district]
  .filter(Boolean)
  .join(' ');

/** Single-line address, e.g. for JSON-LD, llms.txt and application forms. */
export const ADDRESS_FULL = [
  ADDRESS.street,
  ADDRESS_LOCALITY,
  ADDRESS.city,
  ADDRESS.country,
].join(', ');

/**
 * Coordinates of the registered office, taken from Google's own record for the
 * building (Google labels it "İnkılap, Haşim İşcan Sk. 4 A, 34768
 * Ümraniye/İstanbul"). Used for the map link and schema.org geo data.
 */
export const ADDRESS_GEO = {
  latitude: 41.033541,
  longitude: 29.109616,
} as const;

/**
 * Links straight to the coordinates rather than to an address search, so the
 * pin always lands on the office — a text search for "Kent Sitesi F Blok
 * No: 4/33" is not guaranteed to resolve.
 */
export const ADDRESS_MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${ADDRESS_GEO.latitude}%2C${ADDRESS_GEO.longitude}`;

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
  { label: 'nav.tools', href: '/tools/' },
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
    { label: 'tools.title', href: '/tools/' },
    { label: 'footer.privacy', href: '/privacy-policy/' },
  ],
} as const;

export const WEB3FORMS_KEY = import.meta.env.PUBLIC_WEB3FORMS_KEY || '';

export const PLAUSIBLE_DOMAIN = 'sekoya.tech';

export const GA_MEASUREMENT_ID = 'G-B228RH4CK1';

export const GISCUS = {
  repo: 'sekoyatech/sekoyatech.github.io',
  repoId: 'R_kgDORnIRIA',
  category: 'General',
  categoryId: 'DIC_kwDORnIRIM4C4d4b',
} as const;

export const BLOG = {
  postsPerPage: 6,
} as const;
