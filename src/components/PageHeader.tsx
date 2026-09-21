import Breadcrumbs from '@/components/Breadcrumbs';
import Reveal from '@/components/Reveal';
import type { Crumb } from '@/seo/routeMeta';

interface PageHeaderProps {
  /** Chain after "Home", ending with this page (RouteMeta.breadcrumbs). */
  breadcrumbs: Crumb[];
  eyebrow?: string;
  /** Rendered as the page's single <h1>. */
  title: string;
  lead?: string;
}

/**
 * Opening block shared by the index and category pages: breadcrumb trail, eyebrow,
 * <h1>, gold rule and an optional lead paragraph.
 *
 * PageLayout already clears the fixed navbar, so the top padding here is only
 * breathing room. A <header> inside <main> is not a banner landmark.
 */
const PageHeader = ({ breadcrumbs, eyebrow, title, lead }: PageHeaderProps) => (
  <header className="mx-auto max-w-7xl px-4 pb-12 pt-10 sm:px-6 md:pb-16 md:pt-14">
    <Breadcrumbs items={breadcrumbs} />
    <Reveal className="mt-8 max-w-3xl md:mt-12">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1 className="mt-4 font-display text-4xl/[1.08] font-medium tracking-tight text-foreground sm:text-5xl/[1.08] lg:text-6xl/[1.08]">
        {title}
      </h1>
      <div className="rule mt-8" aria-hidden="true" />
      {lead && (
        <p className="mt-6 text-lg/relaxed text-muted-foreground md:text-xl/relaxed">{lead}</p>
      )}
    </Reveal>
  </header>
);

export default PageHeader;
