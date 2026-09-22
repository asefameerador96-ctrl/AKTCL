import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import PageLayout from '@/components/PageLayout';
import ImageCarousel from '@/components/ImageCarousel';
import Reveal from '@/components/Reveal';
import PageHeader, {
  ArrowTravel,
  BODY,
  DrawnRule,
  ROW_LINE,
  ROW_SHIFT,
  SECTION_B,
  SECTION_T,
  WRAP,
} from '@/components/PageHeader';
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
  /** Mono label of the masthead: the category, or the journey stage. */
  eyebrow?: string;
  /** Rendered as the page's single <h1>. */
  title: string;
  lead: string;
  body?: string[];
  images: SiteImage[];
  /** true for product cut-outs: shown whole on the light tile, in a portrait frame. */
  containImages?: boolean;
  /** Data sheet slot (<SpecCard>), set under the copy. Brings its own <h2>. */
  specs?: ReactNode;
  /**
   * Position in a sequence whose order carries meaning — a journey stage's "03 / 07" —
   * set opposite the eyebrow. Left out where the order is only a list's (products).
   */
  counter?: string;
  prev?: DetailPageLink;
  next?: DetailPageLink;
  /** "More in this category" slot. Brings its own rule and <h2> (SectionHead). */
  related?: ReactNode;
  /** Shows "Enquire Now" and pre-selects this product on the enquiry form. */
  enquiryProduct?: string;
}

// Painted width of the media column, so the browser never fetches a wider file.
const SIZES_COVER = '(min-width: 1280px) 720px, (min-width: 1024px) 58vw, calc(100vw - 32px)';
const SIZES_CONTAIN = '(min-width: 1280px) 514px, (min-width: 768px) 42vw, (min-width: 500px) 448px, calc(100vw - 32px)';

// The region splits at lg for photography (7/5) and already at md for the portrait
// cut-outs (5/7), which would otherwise stand alone in half a tablet's width.
// Sticky: whichever column is the shorter holds while the other scrolls past it; the
// taller one fills the row and so never sticks. top = the fixed navbar (h-16, lg:h-20),
// so the photograph holds flush under it.
const SPLIT = {
  cover: {
    grid: 'lg:grid-cols-12',
    rule: 'hidden lg:block left-[58.333333%]',
    sticky: 'lg:sticky lg:top-20 lg:self-start',
    media: 'lg:col-span-7',
    copy: 'lg:col-span-5 lg:pl-8 xl:pl-12',
  },
  contain: {
    grid: 'md:grid-cols-12',
    rule: 'hidden md:block left-[41.666667%]',
    sticky: 'md:sticky md:top-16 md:self-start lg:top-20',
    media: 'max-w-md md:col-span-5 md:max-w-none',
    copy: 'md:col-span-7 md:pl-8 xl:pl-12',
  },
} as const;

interface PagerRowProps extends DetailPageLink {
  direction: 'Previous' | 'Next';
}

/**
 * One ruled row of the previous / next directory: mono direction, the destination in
 * the display serif, a travelling arrow. The whole row is the link; on hover its
 * hairline is redrawn in the accent and the name steps 8px along.
 */
const PagerRow = ({ direction, label, to }: PagerRowProps) => (
  <li>
    <Link
      to={to}
      aria-label={`${direction}: ${label}`}
      data-cursor="open"
      className="group relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 gap-y-3 border-t border-border py-7 md:py-9 lg:grid-cols-12 lg:gap-x-0"
    >
      <span aria-hidden="true" className={ROW_LINE} />
      <span className="eyebrow col-span-2 lg:col-span-3">{direction}</span>
      <span className={cn('display-md text-foreground lg:col-span-8', ROW_SHIFT)}>{label}</span>
      <ArrowTravel
        direction={direction === 'Previous' ? 'left' : 'right'}
        strokeWidth={1.25}
        className="h-6 w-6 justify-self-end text-foreground transition-colors group-hover:text-accent group-focus-visible:text-accent md:h-8 md:w-8"
      />
    </Link>
  </li>
);

/**
 * The template behind every journey stage and product page, drawn like a sheet of a
 * plan: the masthead, then one ruled region split 7/5 by a vertical hairline — the
 * photographs flush against the rules on one side, the copy and the data sheet on the
 * other; the shorter column holds while the longer one scrolls — then related items in
 * a shared-border grid and a two-row previous / next directory.
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
  const split = SPLIT[containImages ? 'contain' : 'cover'];

  return (
    <PageLayout enquiryProduct={enquiryProduct}>
      <article key={pageKey} className={SECTION_B}>
        {/* Its closing hairline is the top rule of the split below. */}
        <PageHeader breadcrumbs={breadcrumbs} eyebrow={eyebrow} meta={counter} title={title} size="compact" />

        <div className={WRAP}>
          <div className={cn('relative grid border-b border-border', split.grid)}>
            {/* The dividing hairline runs the full height of the region, whichever
                column is the taller. */}
            <DrawnRule axis="y" trigger="enter" delay={0.6} className={cn('absolute inset-y-0', split.rule)} />

            {/* Flush: no gutter between the photograph and the rules around it. -mb-px:
                where this column is the taller, the carousel strip's closing rule lies
                on the region's own instead of doubling it. */}
            <div className={cn('-mb-px min-w-0', split.sticky, split.media)}>
              <ImageCarousel
                images={images}
                contain={containImages}
                sizes={containImages ? SIZES_CONTAIN : SIZES_COVER}
                label={`${title} — photographs`}
                reveal
              />
            </div>

            <div className={cn('min-w-0 py-10 md:py-12 lg:py-14', split.sticky, split.copy)}>
              {/* First screen on a desktop: data-enter keeps the prerendered copy
                  unpainted until the app can bring it in once (see index.css). */}
              <div data-enter="">
                <Reveal delay={0.1}>
                  {/* The standfirst is display type, not a large sans lead: the sans stays at body size. */}
                  <p className="display-xs max-w-[30ch] leading-[1.18] text-foreground">{lead}</p>
                  {body.map((paragraph, i) => (
                    <p key={i} className={`${BODY} mt-6`}>
                      {paragraph}
                    </p>
                  ))}
                  {enquiryProduct && (
                    <Magnetic>
                      <Link
                        to={`/contact?product=${encodeURIComponent(enquiryProduct)}`}
                        data-lead="detail-enquire"
                        data-cursor="enquire"
                        className="group btn btn-lg btn-solid mt-10"
                      >
                        Enquire Now
                        <ArrowTravel />
                      </Link>
                    </Magnetic>
                  )}
                </Reveal>
              </div>

              {specs && <div className="mt-12 md:mt-16">{specs}</div>}
            </div>
          </div>
        </div>

        {related && <div className={cn(WRAP, SECTION_T)}>{related}</div>}

        {(prev || next) && (
          <nav aria-label="Previous and next" className={cn(WRAP, SECTION_T)}>
            {/* role: Preflight strips the markers, and with them the list role in Safari. */}
            <ul role="list" className="border-b border-border">
              {prev && <PagerRow direction="Previous" {...prev} />}
              {next && <PagerRow direction="Next" {...next} />}
            </ul>
          </nav>
        )}
      </article>
    </PageLayout>
  );
};

export default DetailPage;
