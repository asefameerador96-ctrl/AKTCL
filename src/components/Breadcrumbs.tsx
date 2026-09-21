import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import type { Crumb } from '@/seo/routeMeta';

export interface BreadcrumbsProps {
  /** Chain AFTER "Home" (which is always rendered first). The last item is the current page. */
  items: Crumb[];
  className?: string;
}

// The trail is set in the site's mono label (.eyebrow: 13px, uppercase, tracked, muted —
// and the ink palette by itself inside bg-ink / on-ink). Links darken to the text
// colour; nothing else moves. min-h keeps each crumb a 44px target; the drawn
// underline sits on the word inside it, not on the box.
const LINK =
  'inline-flex min-h-11 items-center rounded-sm transition-colors hover:text-foreground focus-visible:text-foreground [.bg-ink_&]:hover:text-ink-foreground [.on-ink_&]:hover:text-ink-foreground';
const CURRENT = 'inline-flex min-h-11 items-center text-foreground [.bg-ink_&]:text-ink-foreground [.on-ink_&]:text-ink-foreground';

const Separator = ({ className }: { className?: string }) => (
  <span aria-hidden="true" className={cn('opacity-50', className)}>
    /
  </span>
);

/**
 * Visible trail only — the matching BreadcrumbList JSON-LD is emitted by RouteSeo.
 *
 * Quiet, not small: it is the running head above the masthead's first rule, not part
 * of the headline, but it is read at the label's full 13px. On a phone a three-deep
 * trail used to wrap onto a second 44px line, so there the current page — which the
 * <h1> directly below states anyway — is left to screen readers and the visible trail
 * ends at its parent.
 */
const Breadcrumbs = ({ items, className }: BreadcrumbsProps) => {
  const collapses = items.length > 1;

  return (
    <nav aria-label="Breadcrumb" className={cn('eyebrow', className)}>
      {/* The separator trails its item, so a wrapped line never opens with a stray "/". */}
      <ol className="flex flex-wrap items-center gap-x-2.5">
        <li className="flex items-center gap-x-2.5">
          <Link to="/" className={LINK}>
            <span className="link-underline pb-0.5">Home</span>
          </Link>
          {items.length > 0 && <Separator />}
        </li>
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1;
          const beforeCurrent = index === items.length - 2;
          return isCurrent ? (
            <li key={item.path} className={cn(collapses && 'max-sm:sr-only')}>
              <span aria-current="page" className={CURRENT}>
                {item.name}
              </span>
            </li>
          ) : (
            <li key={item.path} className="flex items-center gap-x-2.5">
              <Link to={item.path} className={LINK}>
                <span className="link-underline pb-0.5">{item.name}</span>
              </Link>
              <Separator className={cn(collapses && beforeCurrent && 'max-sm:hidden')} />
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
