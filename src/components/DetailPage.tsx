import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import PageLayout from '@/components/PageLayout';
import Breadcrumbs from '@/components/Breadcrumbs';
import ImageCarousel from '@/components/ImageCarousel';
import Reveal from '@/components/Reveal';
import { ArrowTravel, DISPLAY_H1_COMPACT, DrawnRule, LABEL } from '@/components/PageHeader';
import SplitReveal from '@/components/motion/SplitReveal';
import Magnetic from '@/components/motion/Magnetic';
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
  /** Data card slot (<SpecCard>), set under the copy. Brings its own <h2>. */
  specs?: ReactNode;
  /** Position in a sequence, e.g. "03 / 07": set as outlined numerals in the masthead. */
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
const SIZES_COVER = '(min-width: 1280px) 700px, (min-width: 1024px) 56vw, calc(100vw - 32px)';
const SIZES_CONTAIN = '(min-width: 1280px) 490px, (min-width: 1024px) 40vw, (min-width: 500px) 448px, calc(100vw - 32px)';

// Whichever column is the shorter holds while the other scrolls past it; the taller
// one fills the row and so never sticks. top clears the fixed navbar.
const STICKY = 'lg:sticky lg:top-28 lg:self-start';

// The site's primary call to action: the same accent pill as the navbar and hero.
const CTA =
  'group mt-10 inline-flex min-h-12 items-center justify-center gap-3 rounded-md bg-accent px-8 font-sans text-sm font-semibold uppercase tracking-[0.18em] text-accent-foreground transition-colors duration-500 ease-expo-out hover:bg-accent/90';

const PAGER_LINK =
  'group relative isolate flex min-h-11 flex-col gap-4 py-10 transition-colors duration-500 ease-expo-out md:gap-6 md:py-16 ' +
  // A wash rises behind the label; the band reads as one large control.
  'before:absolute before:inset-0 before:-z-10 before:origin-bottom before:scale-y-0 before:bg-secondary/60 before:transition-transform before:duration-700 before:ease-expo-out hover:before:scale-y-100 focus-visible:before:scale-y-100';
const PAGER_LABEL =
  'font-display text-[length:clamp(1.75rem,4.2vw,3.75rem)] font-normal leading-[1.02] tracking-[-0.025em] text-foreground transition-transform duration-700 ease-expo-out';

/** "03 / 07" as a giant outlined numeral with its total beside it. Read out once, as given. */
const Counter = ({ value }: { value: string }) => {
  const [current, total] = value.split('/').map((part) => part.trim());
  return (
    <Reveal
      as="p"
      trigger="enter"
      delay={0.3}
      className="order-first flex items-baseline gap-3 lg:order-none lg:col-span-3 lg:justify-end"
    >
      <span className="sr-only">{value}</span>
      <span
        aria-hidden="true"
        className="font-display text-[length:clamp(4.5rem,11vw,10rem)] font-normal leading-[0.8] tracking-[-0.04em] text-outline text-accent"
      >
        {current}
      </span>
      {total && (
        <span aria-hidden="true" className={cn(LABEL, 'tabular-nums')}>
          / {total}
        </span>
      )}
    </Reveal>
  );
};

/**
 * The template behind every journey stage and product page, set like a magazine
 * spread: a masthead with the title at display scale (and the stage's outlined
 * numeral), then the photographs beside the copy — the shorter column holds while
 * the longer one scrolls — then related items and a ruled previous/next band.
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
  // the entrances replay, while the navbar and footer stay mounted.
  const pageKey = breadcrumbs[breadcrumbs.length - 1]?.path ?? title;

  return (
    <PageLayout enquiryProduct={enquiryProduct}>
      <article key={pageKey}>
        <header className={cn(WRAP, 'pt-8 md:pt-12')}>
          <Reveal trigger="enter" from="none">
            <Breadcrumbs items={breadcrumbs} />
          </Reveal>

          <div className="mt-10 grid items-end gap-x-10 gap-y-8 md:mt-16 lg:grid-cols-12">
            <div className={counter ? 'lg:col-span-9' : 'lg:col-span-12'}>
              {eyebrow && (
                <Reveal as="p" trigger="enter" from="none" delay={0.05} className="eyebrow">
                  {eyebrow}
                </Reveal>
              )}
              <SplitReveal
                as="h1"
                trigger="enter"
                delay={0.12}
                text={title}
                className={cn('mt-4 max-w-[16ch] md:mt-5', DISPLAY_H1_COMPACT)}
              />
            </div>
            {counter && <Counter value={counter} />}
          </div>

          <DrawnRule trigger="enter" delay={0.45} className="mt-8 md:mt-12" />
        </header>

        <div className={cn(WRAP, 'pb-20 pt-10 md:pb-28 md:pt-14')}>
          <div className="grid gap-x-16 gap-y-12 lg:grid-cols-12">
            <div
              className={cn(
                'min-w-0',
                STICKY,
                // Portrait cut-outs get the narrower column; landscape photography the wider.
                containImages ? 'mx-auto w-full max-w-md lg:col-span-5 lg:max-w-none' : 'lg:col-span-7'
              )}
            >
              <ImageCarousel
                images={images}
                contain={containImages}
                sizes={containImages ? SIZES_CONTAIN : SIZES_COVER}
                label={`${title} — photographs`}
                reveal
              />
            </div>

            <div className={cn('min-w-0', STICKY, containImages ? 'lg:col-span-6 lg:col-start-7' : 'lg:col-span-5')}>
              {/* First screen on a desktop: data-enter keeps the prerendered copy
                  unpainted until the app can bring it in once (see index.css). */}
              <div data-enter="">
                <Reveal delay={0.1}>
                  <p className="max-w-[34ch] text-xl/[1.5] text-foreground md:text-2xl/[1.45]">{lead}</p>
                  {body.map((paragraph, i) => (
                    <p
                      key={i}
                      className="mt-6 max-w-[64ch] text-base/[1.75] text-muted-foreground md:text-[1.0625rem]/[1.75]"
                    >
                      {paragraph}
                    </p>
                  ))}
                  {enquiryProduct && (
                    <Magnetic>
                      <Link
                        to={`/contact?product=${encodeURIComponent(enquiryProduct)}`}
                        data-lead="detail-enquire"
                        data-cursor="enquire"
                        className={CTA}
                      >
                        Enquire Now
                        <ArrowTravel />
                      </Link>
                    </Magnetic>
                  )}
                </Reveal>
              </div>

              {specs && <div className="mt-16 md:mt-20">{specs}</div>}
            </div>
          </div>
        </div>

        {related && (
          <div className="border-t border-border">
            <div className={cn(WRAP, 'py-20 md:py-28')}>{related}</div>
          </div>
        )}

        {(prev || next) && (
          <nav aria-label="Previous and next" className="border-t border-border">
            <div className={cn(WRAP, 'grid sm:grid-cols-2')}>
              {prev ? (
                <Link
                  to={prev.to}
                  aria-label={`Previous: ${prev.label}`}
                  data-cursor="open"
                  className={cn(PAGER_LINK, 'items-start sm:pr-8')}
                >
                  <span className={cn(LABEL, 'flex items-center gap-3 text-accent')}>
                    <ArrowTravel direction="left" />
                    Previous
                  </span>
                  <span className={cn(PAGER_LABEL, 'group-hover:-translate-x-1.5 group-focus-visible:-translate-x-1.5')}>
                    {prev.label}
                  </span>
                </Link>
              ) : (
                <span aria-hidden="true" className="hidden sm:block" />
              )}
              {next && (
                <Link
                  to={next.to}
                  aria-label={`Next: ${next.label}`}
                  data-cursor="open"
                  className={cn(
                    PAGER_LINK,
                    'items-end border-border text-right sm:col-start-2 sm:border-l sm:pl-8',
                    prev && 'border-t sm:border-t-0'
                  )}
                >
                  <span className={cn(LABEL, 'flex items-center gap-3 text-accent')}>
                    Next
                    <ArrowTravel />
                  </span>
                  <span className={cn(PAGER_LABEL, 'group-hover:translate-x-1.5 group-focus-visible:translate-x-1.5')}>
                    {next.label}
                  </span>
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
