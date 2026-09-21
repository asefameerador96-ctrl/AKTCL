import type { ReactNode } from 'react';
import PageLayout from '@/components/PageLayout';
import Breadcrumbs from '@/components/Breadcrumbs';
import Reveal from '@/components/Reveal';
import { ROUTE_BY_PATH } from '@/seo/routeMeta';

export interface LegalPageProps {
  /** Route path, e.g. "/privacy" — the breadcrumb chain is read from ROUTE_BY_PATH. */
  path: string;
  /** The page's <h1>. */
  title: string;
  /** Month and year as they should read, e.g. "September 2026". */
  lastUpdated: string;
  /** Plain <h2>/<p>/<ul>/<a> markup; the styling comes from this wrapper. */
  children: ReactNode;
}

/*
 * Long-form text styles. The Tailwind typography plugin is not installed, so the
 * wrapper styles its descendants directly and the pages stay plain markup.
 */
const PROSE = [
  'mt-10 max-w-3xl text-base/relaxed text-muted-foreground marker:text-accent md:mt-14 md:text-lg/relaxed',
  '[&_h2]:mb-4 [&_h2]:mt-12 [&_h2]:text-2xl/snug [&_h2]:font-medium [&_h2]:text-foreground md:[&_h2]:mt-14 md:[&_h2]:text-3xl/snug',
  '[&_p]:mt-4',
  '[&_ul]:mt-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6 [&_li]:pl-1',
  '[&_a]:font-medium [&_a]:text-accent [&_a]:underline [&_a]:underline-offset-4 [&_a]:transition-colors hover:[&_a]:text-foreground',
  '[&_strong]:font-semibold [&_strong]:text-foreground',
].join(' ');

/** Shared shell for the Privacy Notice and Terms of Use. */
const LegalPage = ({ path, title, lastUpdated, children }: LegalPageProps) => (
  <PageLayout>
    <article className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 md:pb-28 md:pt-14">
      <Breadcrumbs items={ROUTE_BY_PATH[path]?.breadcrumbs ?? [{ name: title, path }]} />
      <Reveal as="header" className="mt-8 max-w-3xl md:mt-12">
        <p className="eyebrow">Legal</p>
        <h1 className="mt-4 text-4xl/[1.08] font-medium tracking-tight sm:text-5xl/[1.08] lg:text-6xl/[1.08]">
          {title}
        </h1>
        <div className="rule mt-8" aria-hidden="true" />
        <p className="mt-6 text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
      </Reveal>

      {/* No <Reveal> here: a block this tall may never cross the reveal threshold on
          a short viewport, and legal text must not depend on an animation to show. */}
      <div className={PROSE}>{children}</div>
    </article>
  </PageLayout>
);

export default LegalPage;
