import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import PageLayout from '@/components/PageLayout';
import Reveal from '@/components/Reveal';
import SplitReveal from '@/components/motion/SplitReveal';

// `lead` marks the one row that is an enquiry route (data-lead, for the lead tracker).
const DESTINATIONS: { to: string; label: string; lead?: string }[] = [
  { to: '/journey', label: 'Our Journey' },
  { to: '/products', label: 'Products' },
  { to: '/contact', label: 'Contact', lead: 'notfound-contact' },
];

/**
 * Catch-all route. RouteSeo already marks unknown paths noindex, so this only has
 * to get the visitor back on track. No closing enquiry band: the page is its own
 * short list of ways forward.
 *
 * The numerals are the display moment — outlined, monumental, decorative (the mono
 * line and the <h1> say the same to a screen reader). Beside them, ruled off by the
 * page's one vertical hairline: the statement and three directory rows. Both cells
 * are as tall as what they hold and centred on each other: no stretch of empty page
 * between a label and the thing it labels.
 */
const NotFound = () => (
  <PageLayout showEnquiryCta={false}>
    <section className="mx-auto grid max-w-7xl px-4 sm:px-6 lg:grid-cols-12">
      <div className="flex flex-col gap-8 py-12 md:py-16 lg:col-span-7 lg:justify-center lg:py-24 lg:pr-12">
        <Reveal as="p" trigger="enter" from="none" className="eyebrow">
          Error 404
        </Reveal>
        {/* The colour sits on the wrapper: cn() would take "text-outline" for one (index.css). */}
        <Reveal trigger="enter" from="none" delay={0.1} className="text-foreground">
          <p
            aria-hidden="true"
            // Fluid in both compositions: the numerals fill the single column on a phone
            // (68vw) and the seven-column cell from lg (40vw); measured, "404" sets 1.16em wide.
            className="text-outline select-none font-display text-[length:clamp(10rem,68vw,24rem)] font-normal leading-[0.8] tracking-[-0.04em] lining-nums lg:text-[length:clamp(20rem,40vw,34rem)]"
          >
            404
          </p>
        </Reveal>
      </div>

      <div className="flex flex-col justify-center border-t border-border py-12 md:py-16 lg:col-span-5 lg:border-l lg:border-t-0 lg:py-24 lg:pl-12">
        <SplitReveal as="h1" trigger="enter" delay={0.2} text="Page not found" className="display-md text-foreground" />
        <Reveal as="p" trigger="enter" delay={0.4} className="lead mt-6 max-w-[44ch]">
          The page you are looking for may have moved, or the address may be mistyped. These will get you back on
          track.
        </Reveal>

        <Reveal trigger="enter" delay={0.5} className="mt-12">
          <ul className="hairline-rows">
            {DESTINATIONS.map(({ to, label, lead }) => (
              <li key={to}>
                {/* A row, not a button: the label shifts 8px and the arrow darkens. */}
                <Link to={to} data-lead={lead} className="group flex min-h-16 items-center gap-5 text-foreground">
                  <span className="display-xs flex-1 transition-transform group-hover:translate-x-2 group-focus-visible:translate-x-2">
                    {label}
                  </span>
                  <ArrowRight
                    aria-hidden="true"
                    className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-accent group-focus-visible:text-accent"
                  />
                </Link>
              </li>
            ))}
          </ul>

          <Link
            to="/"
            className="mono-label link-underline mt-8 inline-block bg-origin-content py-3.5 text-muted-foreground transition-[background-size,color] hover:text-foreground"
          >
            Return to the homepage
          </Link>
        </Reveal>
      </div>
    </section>
  </PageLayout>
);

export default NotFound;
