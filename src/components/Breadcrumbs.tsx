import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import type { Crumb } from '@/seo/routeMeta';

export interface BreadcrumbsProps {
  /** Chain AFTER "Home" (which is always rendered first). The last item is the current page. */
  items: Crumb[];
  className?: string;
}

// Emphasis comes from opacity and weight, never a second colour, so a page can put
// the trail on a dark band by passing one text colour in className.
const LINK =
  'inline-flex min-h-11 items-center rounded-sm opacity-70 underline-offset-4 transition-opacity hover:underline hover:opacity-100 focus-visible:opacity-100';

const Separator = () => (
  <span aria-hidden="true" className="opacity-40">
    /
  </span>
);

/** Visible trail only — the matching BreadcrumbList JSON-LD is emitted by RouteSeo. */
const Breadcrumbs = ({ items, className }: BreadcrumbsProps) => (
  <nav
    aria-label="Breadcrumb"
    className={cn('font-sans text-xs uppercase tracking-[0.18em] text-foreground', className)}
  >
    {/* The separator trails its item, so a wrapped line never opens with a stray "/". */}
    <ol className="flex flex-wrap items-center gap-x-2.5">
      <li className="flex items-center gap-x-2.5">
        <Link to="/" className={LINK}>
          Home
        </Link>
        {items.length > 0 && <Separator />}
      </li>
      {items.map((item, index) =>
        index === items.length - 1 ? (
          <li key={item.path}>
            <span aria-current="page" className="inline-flex min-h-11 items-center font-semibold">
              {item.name}
            </span>
          </li>
        ) : (
          <li key={item.path} className="flex items-center gap-x-2.5">
            <Link to={item.path} className={LINK}>
              {item.name}
            </Link>
            <Separator />
          </li>
        )
      )}
    </ol>
  </nav>
);

export default Breadcrumbs;
