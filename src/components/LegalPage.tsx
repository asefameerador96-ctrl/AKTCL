import type { ReactNode } from 'react';
import PageLayout from '@/components/PageLayout';
import PageHeader, { WRAP } from '@/components/PageHeader';
import Reveal from '@/components/Reveal';
import { site } from '@/content/site';
import { ROUTE_BY_PATH } from '@/seo/routeMeta';
import { cn } from '@/lib/utils';

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
 * wrapper styles its descendants directly and the pages stay plain markup. Every <h2>
 * is ruled off with a hairline above it and set at the display-sm step (the same
 * clamp — the pages' headings are plain markup, so the class itself cannot be put on
 * them).
 *
 * The measure is about 68 characters a line. It is set in rem, not ch: the sans has a
 * wide zero (1ch is 0.73em), so "68ch" would come out near 100 characters.
 */
const PROSE = [
  'text-base leading-relaxed text-muted-foreground marker:text-accent md:text-[17px]',
  // On the children, not the box: the box carries the cell's padding.
  '[&>*:first-child]:mt-0 [&>*]:max-w-[36rem]',
  '[&_h2]:mb-5 [&_h2]:mt-14 [&_h2]:border-t [&_h2]:border-border [&_h2]:pt-8 [&_h2]:text-[length:clamp(1.75rem,3vw,2.75rem)] [&_h2]:leading-[1.08] [&_h2]:tracking-[-0.02em] [&_h2]:text-foreground md:[&_h2]:mt-20 md:[&_h2]:pt-10',
  '[&_p]:mt-4',
  '[&_ul]:mt-4 [&_ul]:list-[square] [&_ul]:space-y-2 [&_ul]:pl-5 [&_li]:pl-2',
  // Links are told apart by their underline, not by colour alone.
  '[&_a]:rounded-sm [&_a]:font-medium [&_a]:text-foreground [&_a]:underline [&_a]:decoration-accent [&_a]:underline-offset-4 [&_a]:transition-colors hover:[&_a]:text-accent',
  '[&_strong]:font-semibold [&_strong]:text-foreground',
].join(' ');

/**
 * Shared shell for the Privacy Notice and Terms of Use: the inner pages' masthead
 * (compact), then a ruled 4/8 split — the mono "last updated" note holds in the
 * narrow cell while the text runs down the wide one.
 */
const LegalPage = ({ path, title, lastUpdated, children }: LegalPageProps) => (
  <PageLayout>
    <article className="pb-24 md:pb-36">
      <PageHeader
        breadcrumbs={ROUTE_BY_PATH[path]?.breadcrumbs ?? [{ name: title, path }]}
        eyebrow="Legal"
        meta={site.shortName}
        title={title}
        size="compact"
      />

      <div className={WRAP}>
        {/* The grid is its own box inside the gutters, so the rule's percentage is the grid's. */}
        <div className="relative grid border-b border-border lg:grid-cols-12">
          <span aria-hidden="true" className="absolute inset-y-0 left-[33.333333%] hidden w-px bg-border lg:block" />

          <Reveal
            trigger="enter"
            from="none"
            delay={0.6}
            className="border-b border-border py-6 lg:sticky lg:top-24 lg:col-span-4 lg:self-start lg:border-b-0 lg:py-10"
          >
            <p className="eyebrow">Last updated</p>
            <p className="index-num mt-3 uppercase leading-normal text-foreground">{lastUpdated}</p>
          </Reveal>

          {/* No <Reveal> here: a block this tall may never cross the reveal threshold on
              a short viewport, and legal text must not depend on an animation to show. */}
          <div className={cn(PROSE, 'pb-16 pt-10 md:pb-24 lg:col-span-8 lg:pl-8')}>{children}</div>
        </div>
      </div>
    </article>
  </PageLayout>
);

export default LegalPage;
