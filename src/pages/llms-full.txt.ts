import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { SITE, SOCIAL } from '../lib/constants';
import teamData from '../data/team.json';
import portfolioData from '../data/portfolio.json';

export const GET: APIRoute = async () => {
  const services = (await getCollection('services')).sort((a, b) => a.data.order - b.data.order);
  const blogPosts = (await getCollection('blog'))
    .filter((p) => !p.data.draft)
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
  const portfolioItems = portfolioData;
  const teamMembers = teamData.sort((a, b) => a.order - b.order);
  const testimonials = (await getCollection('testimonials')).sort((a, b) => a.data.order - b.data.order);

  const lines: string[] = [];

  // Header
  lines.push(`# ${SITE.fullName}`);
  lines.push('');
  lines.push(`> ${SITE.description}`);
  lines.push('');
  lines.push(`- Website: ${SITE.url}`);
  lines.push(`- Email: ${SITE.email}`);
  lines.push(`- Phone: ${SITE.phone}`);
  lines.push(`- LinkedIn: ${SOCIAL.linkedin}`);
  lines.push(`- GitHub: ${SOCIAL.github}`);
  lines.push(`- Founded: ${SITE.foundedYear}`);
  lines.push('');

  // About
  lines.push('## About Sekoya');
  lines.push('');
  lines.push('Established in 2024, Sekoya Group Information and Technology is a pioneer in industrial transformation, continuously offering innovative solutions to provide our customers with a competitive advantage. With an experienced team and a strong R&D infrastructure, we push the boundaries of industrial IoT, machine learning, and artificial intelligence technologies. Focused on our customers\' needs, we aim to deliver scalable, reliable, and user-friendly solutions.');
  lines.push('');

  // Services
  lines.push('## Services');
  lines.push('');
  for (const service of services) {
    lines.push(`### ${service.data.title}`);
    lines.push('');
    lines.push(service.data.description);
    lines.push('');
    if (service.data.features.length > 0) {
      lines.push('**Key features:**');
      for (const feature of service.data.features) {
        lines.push(`- ${feature}`);
      }
      lines.push('');
    }
    lines.push(`URL: ${SITE.url}/services/${service.id}/`);
    lines.push('');
  }

  // Portfolio
  lines.push('## Portfolio & Case Studies');
  lines.push('');
  for (const project of portfolioItems) {
    lines.push(`### ${project.title}`);
    lines.push('');
    lines.push(project.description);
    lines.push('');
    lines.push(`- Year: ${project.year}`);
    if (project.client) lines.push(`- Client: ${project.client}`);
    lines.push(`- Tech Stack: ${project.techStack.join(', ')}`);
    lines.push(`- URL: ${SITE.url}/portfolio/${project.slug}/`);
    lines.push('');
  }

  // Team
  lines.push('## Team');
  lines.push('');
  for (const member of teamMembers) {
    lines.push(`### ${member.name} — ${member.role}`);
    lines.push('');
    lines.push(member.bio);
    if (member.linkedin) lines.push(`- LinkedIn: ${member.linkedin}`);
    if (member.github) lines.push(`- GitHub: ${member.github}`);
    lines.push('');
  }

  // Testimonials
  lines.push('## Client Testimonials');
  lines.push('');
  for (const t of testimonials) {
    lines.push(`> "${t.data.quote}"`);
    lines.push(`> — ${t.data.author}, ${t.data.company}`);
    lines.push('');
  }

  // Blog
  lines.push('## Blog Articles');
  lines.push('');
  for (const post of blogPosts) {
    lines.push(`### ${post.data.title}`);
    lines.push('');
    lines.push(`Published: ${post.data.pubDate.toISOString().split('T')[0]}`);
    if (post.data.tags.length > 0) lines.push(`Tags: ${post.data.tags.join(', ')}`);
    lines.push('');
    lines.push(post.data.description);
    lines.push('');
    lines.push(`URL: ${SITE.url}/blog/${post.id}/`);
    lines.push('');
  }

  // Contact
  lines.push('## Contact');
  lines.push('');
  lines.push(`For project inquiries, contact us at:`);
  lines.push(`- Email: ${SITE.email}`);
  lines.push(`- Phone: ${SITE.phone}`);
  lines.push(`- Contact Form: ${SITE.url}/contact/`);
  lines.push(`- LinkedIn: ${SOCIAL.linkedin}`);
  lines.push(`- GitHub: ${SOCIAL.github}`);
  lines.push('');

  const content = lines.join('\n');

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
