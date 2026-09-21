import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import PageLayout from '@/components/PageLayout';

const DESTINATIONS = [
  { to: '/journey', label: 'Our Journey' },
  { to: '/products', label: 'Products' },
] as const;

const PILL =
  'group inline-flex min-h-12 items-center gap-3 rounded-md border px-6 font-sans text-sm font-semibold uppercase tracking-[0.18em] transition-colors';

/**
 * Catch-all route. RouteSeo already marks unknown paths noindex, so this only has
 * to get the visitor back on track. No closing enquiry band: the page is its own
 * short list of ways forward.
 */
const NotFound = () => (
  <PageLayout showEnquiryCta={false}>
    <section className="mx-auto flex min-h-[70vh] max-w-3xl flex-col justify-center px-4 py-24 sm:px-6">
      <p className="eyebrow">Error 404</p>
      <h1 className="mt-5 text-5xl font-medium leading-tight md:text-7xl">Page not found</h1>
      <div aria-hidden="true" className="rule mt-8" />
      <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground">
        The page you are looking for may have moved, or the address may be mistyped. These will get
        you back on track.
      </p>

      <ul className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {DESTINATIONS.map(({ to, label }) => (
          <li key={to}>
            <Link
              to={to}
              className={`${PILL} w-full justify-between border-border bg-card text-foreground hover:border-accent/50 hover:text-accent sm:w-auto`}
            >
              {label}
              <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </li>
        ))}
        <li>
          <Link
            to="/contact"
            data-lead="notfound-contact"
            className={`${PILL} w-full justify-between border-accent bg-accent text-accent-foreground hover:bg-accent/90 sm:w-auto`}
          >
            Contact
            <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </li>
      </ul>

      <p className="mt-10">
        <Link
          to="/"
          className="inline-flex min-h-11 items-center rounded-sm text-sm text-muted-foreground underline underline-offset-4 transition-colors hover:text-accent"
        >
          Return to the homepage
        </Link>
      </p>
    </section>
  </PageLayout>
);

export default NotFound;
