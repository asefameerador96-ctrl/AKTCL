import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import PageLayout from '@/components/PageLayout';
import PageHeader from '@/components/PageHeader';
import LazyImage from '@/components/LazyImage';
import Reveal from '@/components/Reveal';
import { journey, journeyIntro } from '@/content/journey';
import { journeyImages } from '@/content/images';
import { hero } from '@/content/site';
import { ROUTE_BY_PATH } from '@/seo/routeMeta';
import { cn } from '@/lib/utils';

const SIZES = '(min-width: 1280px) 576px, (min-width: 768px) 50vw, calc(100vw - 32px)';

const TEXT_LINK =
  'group inline-flex min-h-11 items-center gap-2 text-sm font-medium uppercase tracking-[0.15em] text-accent transition-colors hover:text-foreground';

/** /journey — the seven stages in order, each leading to its own page. */
const JourneyIndex = () => (
  <PageLayout>
    <PageHeader
      breadcrumbs={
        ROUTE_BY_PATH['/journey']?.breadcrumbs ?? [{ name: journeyIntro.heading, path: '/journey' }]
      }
      eyebrow={journeyIntro.eyebrow}
      title={journeyIntro.heading}
      lead={hero.body}
    />

    {/* overflow-x-clip: alternate rows wait 36px to the right before their reveal. */}
    <ol
      // Preflight removes the markers, and with them the list role in Safari.
      role="list"
      className="mx-auto max-w-7xl space-y-20 overflow-x-clip px-4 pb-20 sm:px-6 md:space-y-32 md:pb-32"
    >
      {journey.map((stage, i) => {
        const cover = journeyImages[stage.slug]?.[0];
        const flip = i % 2 === 1;
        return (
          <li key={stage.slug}>
            <article className="grid items-center gap-8 md:grid-cols-2 md:gap-14 lg:gap-20">
              {cover && (
                <Reveal from={flip ? 'right' : 'left'} className={cn('min-w-0', flip && 'md:order-2')}>
                  <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-secondary">
                    <LazyImage
                      image={cover.image}
                      alt={cover.alt}
                      sizes={SIZES}
                      priority={i === 0}
                      className="absolute inset-0 h-full w-full object-cover"
                      style={{ objectPosition: cover.position }}
                    />
                  </div>
                </Reveal>
              )}

              <Reveal delay={0.1} className="min-w-0">
                {/* The <ol> carries the order; the numeral is its visual echo. */}
                <div className="flex items-center gap-5" aria-hidden="true">
                  <span className="font-display text-5xl font-light tabular-nums text-accent md:text-6xl">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="h-px flex-1 bg-border" />
                </div>
                <h2 className="mt-6 font-display text-3xl/tight font-medium text-foreground md:text-4xl/tight">
                  {stage.label}
                </h2>
                <p className="mt-2 font-display text-xl/snug text-foreground/80 md:text-2xl/snug">
                  {stage.title}
                </p>
                <p className="mt-5 max-w-xl text-base/relaxed text-muted-foreground">
                  {stage.short}
                </p>
                <Link to={`/journey/${stage.slug}`} className={cn(TEXT_LINK, 'mt-6')}>
                  Read More
                  <span className="sr-only">
                    {' '}
                    — {stage.label}: {stage.title}
                  </span>
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </Link>
              </Reveal>
            </article>
          </li>
        );
      })}
    </ol>
  </PageLayout>
);

export default JourneyIndex;
