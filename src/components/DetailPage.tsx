import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import PageLayout from '@/components/PageLayout';
import Breadcrumbs from '@/components/Breadcrumbs';
import ImageCarousel from '@/components/ImageCarousel';
import Reveal from '@/components/Reveal';
import type { SiteImage } from '@/content/images';
import type { Crumb } from '@/seo/routeMeta';
import { cn } from '@/lib/utils';

export interface DetailPageLink {
  label: string;
  to: string;
}

interface DetailPageProps {
  /** Chain after "Home", ending with this page (RouteMeta.breadcrumbs). */
  breadcrumbs: Crumb[];
  eyebrow?: string;
  /** Rendered as the page's single <h1>. */
  title: string;
  lead: string;
  body?: string[];
  images: SiteImage[];
  /** true for product cut-outs: shown whole on the light tile, in a portrait frame. */
  containImages?: boolean;
  /** Data card slot (<SpecCard>). Brings its own <h2>. */
  specs?: ReactNode;
  /** Position in a sequence, e.g. "03 / 07". */
  counter?: string;
  prev?: DetailPageLink;
  next?: DetailPageLink;
  /** "More in this category" slot. Brings its own <h2>. */
  related?: ReactNode;
  /** Shows "Enquire Now" and pre-selects this product on the enquiry form. */
  enquiryProduct?: string;
}

// Same gutters as the navbar and footer, so page content lines up with the chrome.
const WRAP = 'mx-auto max-w-7xl px-4 sm:px-6';

// Painted width of the carousel column, so the browser never fetches a wider file.
const SIZES_COVER = '(min-width: 1280px) 576px, (min-width: 768px) 50vw, calc(100vw - 32px)';
const SIZES_CONTAIN =
  '(min-width: 1280px) 480px, (min-width: 768px) 40vw, (min-width: 500px) 448px, calc(100vw - 32px)';

// The site's primary call to action: the same accent pill as the navbar and hero.
const CTA =
  'group mt-9 inline-flex min-h-12 items-center justify-center gap-3 rounded-md bg-accent px-8 font-sans text-sm font-semibold uppercase tracking-[0.18em] text-accent-foreground transition-colors hover:bg-accent/90';

const PAGER_LINK = 'group flex min-h-11 flex-col gap-2 py-8 md:py-12';
const PAGER_KICKER =
  'flex items-center gap-2 text-xs font-medium uppercase tracking-[0.25em] text-accent';
const PAGER_LABEL =
  'font-display text-lg text-foreground transition-colors group-hover:text-accent md:text-2xl';

/**
 * The template behind every journey stage and product page: breadcrumb, photo
 * carousel beside the copy, then the optional data card, related items and a
 * previous/next pager.
 */
const DetailPage = ({
  breadcrumbs,
  eyebrow,
  title,
  lead,
  body = [],
  images,
  containImages = false,
  specs,
  counter,
  prev,
  next,
  related,
  enquiryProduct,
}: DetailPageProps) => {
  // Stage-to-stage navigation reuses this component instance. Keying the content on
  // the page's own path remounts it, so the carousel returns to its first slide and
  // the reveals replay, while the navbar and footer stay mounted.
  const pageKey = breadcrumbs[breadcrumbs.length - 1]?.path ?? title;

  return (
    <PageLayout enquiryProduct={enquiryProduct}>
      {/* overflow-x-clip: the text column waits 36px to the right before its reveal. */}
      <article key={pageKey} className="overflow-x-clip">
        <div className={cn(WRAP, 'pt-10 md:pt-14')}>
          <Breadcrumbs items={breadcrumbs} />
        </div>

        <div className={cn(WRAP, 'pb-16 pt-8 md:pb-24 md:pt-12')}>
          <div
            className={cn(
              'grid items-center gap-10 md:gap-14 lg:gap-20',
              // Portrait cut-outs get the narrower column; landscape photography half.
              containImages ? 'md:grid-cols-[5fr_7fr]' : 'md:grid-cols-2'
            )}
          >
            <Reveal
              from="left"
              className={cn('min-w-0', containImages && 'mx-auto w-full max-w-md md:max-w-none')}
            >
              <ImageCarousel
                images={images}
                contain={containImages}
                sizes={containImages ? SIZES_CONTAIN : SIZES_COVER}
                label={`${title} — photographs`}
              />
            </Reveal>

            <Reveal from="right" delay={0.15} className="min-w-0">
              {(eyebrow || counter) && (
                <div className="mb-4 flex items-center justify-between gap-6">
                  {eyebrow && <p className="eyebrow">{eyebrow}</p>}
                  {counter && (
                    <p className="ml-auto font-sans text-xs font-medium tabular-nums tracking-[0.25em] text-muted-foreground">
                      {counter}
                    </p>
                  )}
                </div>
              )}
              <h1 className="font-display text-3xl/[1.12] font-medium tracking-tight text-foreground md:text-4xl/[1.12] lg:text-5xl/[1.12]">
                {title}
              </h1>
              <div className="rule mt-6" aria-hidden="true" />
              <p className="mt-6 max-w-xl text-lg/relaxed text-foreground md:text-xl/relaxed">
                {lead}
              </p>
              {body.map((paragraph, i) => (
                <p key={i} className="mt-5 max-w-xl text-base/relaxed text-muted-foreground">
                  {paragraph}
                </p>
              ))}
              {enquiryProduct && (
                <Link
                  to={`/contact?product=${encodeURIComponent(enquiryProduct)}`}
                  data-lead="detail-enquire"
                  className={CTA}
                >
                  Enquire Now
                  <ArrowRight
                    aria-hidden="true"
                    className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                  />
                </Link>
              )}
            </Reveal>
          </div>
        </div>

        {specs && (
          <div className={cn(WRAP, 'pb-16 md:pb-24')}>
            <Reveal>{specs}</Reveal>
          </div>
        )}

        {related && (
          <div className="border-t border-border">
            <div className={cn(WRAP, 'py-16 md:py-24')}>{related}</div>
          </div>
        )}

        {(prev || next) && (
          <nav aria-label="Previous and next" className="border-t border-border">
            <div className={cn(WRAP, 'grid grid-cols-2')}>
              {prev ? (
                <Link
                  to={prev.to}
                  aria-label={`Previous: ${prev.label}`}
                  className={cn(PAGER_LINK, 'items-start pr-4')}
                >
                  <span className={PAGER_KICKER}>
                    <ArrowLeft
                      className="h-4 w-4 transition-transform group-hover:-translate-x-1"
                      aria-hidden="true"
                    />
                    Previous
                  </span>
                  <span className={PAGER_LABEL}>{prev.label}</span>
                </Link>
              ) : (
                <span aria-hidden="true" />
              )}
              {next && (
                <Link
                  to={next.to}
                  aria-label={`Next: ${next.label}`}
                  className={cn(
                    PAGER_LINK,
                    'col-start-2 items-end border-l border-border pl-4 text-right'
                  )}
                >
                  <span className={PAGER_KICKER}>
                    Next
                    <ArrowRight
                      className="h-4 w-4 transition-transform group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </span>
                  <span className={PAGER_LABEL}>{next.label}</span>
                </Link>
              )}
            </div>
          </nav>
        )}
      </article>
    </PageLayout>
  );
};

export default DetailPage;
