import { Link, useParams } from 'react-router-dom';
import Breadcrumbs from '@/components/Breadcrumbs';
import PageLayout from '@/components/PageLayout';
import {
  ArrowTravel,
  DISPLAY_H1,
  DrawnRule,
  GROUP_UNDERLINE,
  ROW_LINE,
  ROW_SHIFT,
  SectionHead,
  TEXT_LINK,
  WRAP,
} from '@/components/PageHeader';
import Reveal from '@/components/Reveal';
import { RowLink } from '@/components/Ruled';
import Magnetic from '@/components/motion/Magnetic';
import SplitReveal from '@/components/motion/SplitReveal';
import PackagingSheet from '@/components/sizes/PackagingSheet';
import RodDiagram from '@/components/sizes/RodDiagram';
import NotFound from '@/pages/NotFound';
import { categoryBySlug } from '@/content/products';
import { cigaretteSizes, sizeBySlug, sizesIntro } from '@/content/sizes';
import { ROUTE_BY_PATH } from '@/seo/routeMeta';
import { cn } from '@/lib/utils';

const INDEX_PATH = '/cigarette-sizes';
const LINES_PATH = '/products/finished-cigarettes';
const enquiryHref = (product: string) => `/contact?product=${encodeURIComponent(product)}`;

interface PagerRowProps {
  direction: 'Previous' | 'Next';
  label: string;
  to: string;
}

/** A ruled row of the previous / next directory — the detail pages' own, no numbers. */
const PagerRow = ({ direction, label, to }: PagerRowProps) => (
  <li>
    <Link
      to={to}
      aria-label={`${direction}: ${label}`}
      data-cursor="open"
      className="group relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 gap-y-3 border-t border-border py-9 md:py-12 lg:grid-cols-12 lg:gap-x-0"
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
 * /cigarette-sizes/:slug — one format. The masthead (the format's name, its nominal
 * length as the mono meta line, the enquiry), the format drawn full width on the
 * line-up's shared scale — so stepping from size to size, the rod grows or shrinks
 * truthfully — the AKTCL lines made in it, the packaging and logistics data sheet,
 * and a previous / next directory between the sizes.
 */
const SizePage = () => {
  const params = useParams<{ slug: string }>();
  const size = sizeBySlug(params.slug?.toLowerCase());
  if (!size) return <NotFound />;

  const path = `${INDEX_PATH}/${size.slug}`;
  const product = `${size.name} cigarettes`;
  const index = cigaretteSizes.findIndex((s) => s.slug === size.slug);
  const before = cigaretteSizes[index - 1];
  const after = cigaretteSizes[index + 1];
  const linesLabel = categoryBySlug('finished-cigarettes')?.label ?? 'Finished Cigarettes';

  return (
    <PageLayout enquiryProduct={product}>
      {/* Keyed on the size, so moving between sizes replays the entrances. */}
      <article key={size.slug} className="pb-24 md:pb-32">
        {/* The inner pages' masthead (PageHeader), with the length as a mono meta line
            in its own case: "84 mm", never "84 MM". */}
        <header className={WRAP}>
          <Reveal trigger="enter" from="none" className="pt-3 md:pt-5">
            <Breadcrumbs
              items={
                ROUTE_BY_PATH[path]?.breadcrumbs ?? [
                  { name: sizesIntro.eyebrow, path: INDEX_PATH },
                  { name: size.name, path },
                ]
              }
            />
          </Reveal>
          <DrawnRule trigger="enter" delay={0.1} />

          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 pt-4 md:pt-5">
            <Reveal as="p" trigger="enter" from="none" delay={0.15} className="eyebrow">
              {sizesIntro.eyebrow}
            </Reveal>
            <Reveal as="p" trigger="enter" from="none" delay={0.2} className="flex items-baseline gap-3">
              <span className="eyebrow">Nominal length</span>
              <span className="index-num text-foreground">{size.lengthLabel}</span>
            </Reveal>
          </div>

          <SplitReveal
            as="h1"
            trigger="enter"
            delay={0.2}
            text={size.name}
            className={cn('mt-14 max-w-[18ch] md:mt-24', DISPLAY_H1)}
          />

          <div className="grid pb-14 pt-10 md:pb-20 md:pt-14 lg:grid-cols-12">
            <Reveal trigger="enter" delay={0.5} className="lg:col-span-5 lg:col-start-8 lg:pl-8">
              {/* Only verbatim AKTCL copy: absent until AKTCL supplies a line for the format. */}
              {size.summary && <p className="lead">{size.summary}</p>}
              <Magnetic>
                <Link
                  to={enquiryHref(product)}
                  data-lead="size-enquire"
                  data-cursor="enquire"
                  className={cn('group btn btn-lg btn-solid', size.summary && 'mt-8')}
                >
                  Enquire about {size.name}
                  <ArrowTravel />
                </Link>
              </Magnetic>
            </Reveal>
          </div>

          <DrawnRule trigger="enter" delay={0.55} />
        </header>

        {/* The drawing hangs from the masthead's closing rule. First screen on a
            desktop: data-enter="view" holds it until the app can draw it in. */}
        <section aria-label={`${size.name} format drawing`} data-enter="view" className={WRAP}>
          <figure className="border-b border-border pb-8 pt-12 md:pb-10 md:pt-20">
            <RodDiagram size={size} dimension delay={0.3} />
            <figcaption className="mt-10 flex flex-wrap items-center justify-between gap-x-8 gap-y-3 md:mt-14">
              <span className="eyebrow">Nominal rod length, drawn to scale</span>
              <Link to={INDEX_PATH} data-cursor="open" className={TEXT_LINK}>
                <span className={GROUP_UNDERLINE}>Compare all sizes</span>
                <ArrowTravel />
              </Link>
            </figcaption>
          </figure>
        </section>

        {size.aktclLines.length > 0 && (
          <section aria-labelledby="size-lines-heading" className={cn(WRAP, 'pt-24 md:pt-32')}>
            <SectionHead label={linesLabel} title="Made by AKTCL in this format" id="size-lines-heading" />
            {/* role: Preflight strips the markers, and with them the list role in Safari. */}
            <ul role="list" className="mt-14 md:mt-20">
              {size.aktclLines.map((line, i) => (
                <Reveal as="li" key={line} delay={Math.min(i, 3) * 0.07}>
                  <RowLink
                    to={LINES_PATH}
                    display
                    className={cn(i === size.aktclLines.length - 1 && 'border-b')}
                  >
                    {line}
                  </RowLink>
                </Reveal>
              ))}
            </ul>
          </section>
        )}

        <div className={cn(WRAP, 'pt-24 md:pt-32')}>
          <PackagingSheet size={size} />
        </div>

        <nav aria-label="Previous and next size" className={cn(WRAP, 'pt-24 md:pt-32')}>
          <ul role="list" className="border-b border-border">
            {before && <PagerRow direction="Previous" label={before.name} to={`${INDEX_PATH}/${before.slug}`} />}
            {/* The last size hands back to the whole segment rather than looping round. */}
            {after ? (
              <PagerRow direction="Next" label={after.name} to={`${INDEX_PATH}/${after.slug}`} />
            ) : (
              <PagerRow direction="Next" label={`All ${sizesIntro.eyebrow}`} to={INDEX_PATH} />
            )}
          </ul>
        </nav>
      </article>
    </PageLayout>
  );
};

export default SizePage;
