import type { ReactNode } from 'react';
import PageLayout from '@/components/PageLayout';
import PageHeader, { SECTION_B, SECTION_GAP, WRAP } from '@/components/PageHeader';
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
  'text-base leading-[1.65] text-muted-foreground marker:text-accent md:text-[17px]',
  // On the children, not the box: the box carries the cell's padding.
  '[&>*:first-child]:mt-0 [&>*]:max-w-[38rem]',
  '[&_h2]:mb-5 [&_h2]:mt-10 [&_h2]:border-t [&_h2]:border-border [&_h2]:pt-6 [&_h2]:text-[length:clamp(1.9rem,3vw,2.75rem)] [&_h2]:leading-[1.08] [&_h2]:tracking-[-0.02em] [&_h2]:text-foreground md:[&_h2]:mt-14 md:[&_h2]:pt-8',
  '[&_p]:mt-4',
  '[&_ul]:mt-4 [&_ul]:list-[square] [&_ul]:space-y-2 [&_ul]:pl-5 [&_li]:pl-2',
  // Links are told apart by their underline, not by colour alone.
  '[&_a]:rounded-sm [&_a]:font-medium [&_a]:text-foreground [&_a]:underline [&_a]:decoration-accent [&_a]:underline-offset-4 [&_a]:transition-colors hover:[&_a]:text-accent',
  '[&_strong]:font-semibold [&_strong]:text-foreground',
].join(' ');

/**
 * Shared shell for the Privacy Notice and Terms of Use: the inner pages' masthead
 * (compact), its mono row carrying the "last updated" date opposite the eyebrow, then
 * the text in one reading column that hangs from the masthead's closing rule and is
 * closed by a rule of its own. No side column: a lone date in a tall cell beside the
 * text was an empty column by another name.
 */
const LegalPage = ({ path, title, lastUpdated, children }: LegalPageProps) => (
  <PageLayout>
    <article className={SECTION_B}>
      <PageHeader
        breadcrumbs={ROUTE_BY_PATH[path]?.breadcrumbs ?? [{ name: title, path }]}
        eyebrow="Legal"
        meta={`Last updated ${lastUpdated}`}
        title={title}
        size="compact"
      />

      <div className={WRAP}>
        {/* No <Reveal> here: legal text must not depend on an animation to show. */}
        <div className={cn(PROSE, 'border-b border-border pb-16 md:pb-20', SECTION_GAP)}>{children}</div>
      </div>
    </article>
  </PageLayout>
);

export default LegalPage;
