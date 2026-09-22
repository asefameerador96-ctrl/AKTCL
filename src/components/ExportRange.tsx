import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Reveal from '@/components/Reveal';
import {
  ArrowTravel,
  GROUP_UNDERLINE,
  ROW_LINE,
  ROW_SHIFT,
  SECTION_Y,
  SectionHead,
  TEXT_LINK,
  WRAP,
} from '@/components/PageHeader';
import { categories, productsIntro, type Product, type ProductCategory } from '@/content/products';
import { isStill, revealTransition, useInView, useReveal } from '@/lib/motion';
import { cn } from '@/lib/utils';

interface ExportRangeProps {
  className?: string;
}

/**
 * Products with one line of copy have no page of their own (hasDetailPage: false);
 * their row goes to the category page, which is where they are described.
 */
const productHref = (category: ProductCategory, product: Product) =>
  product.hasDetailPage
    ? `/products/${category.slug}/${product.slug}`
    : `/products/${category.slug}`;

/** Seconds between one row's hairline starting to draw and the next. */
const LINE_STAGGER = 0.04;

const ARROW = 'self-center text-foreground transition-colors group-hover:text-accent group-focus-visible:text-accent';

/**
 * One category as a ruled directory: the product's name in the display serif and a
 * travelling arrow — no index numeral, the list's order is not information. The row
 * IS the link; on hover or focus the rule above it is redrawn in the accent and the
 * name steps 8px along. Each row carries the hairline under it (the category's own
 * rule is the first row's top), and they draw in one after another each time the
 * list comes on screen, and all back out at once as it leaves.
 *
 * Two to a line from md, so the directory is about as tall as the category's head
 * beside it: a single long column left a tall empty cell under the head.
 */
const RangeList = ({ category }: { category: ProductCategory }) => {
  const [still] = useState(isStill);
  const listRef = useRef<HTMLUListElement>(null);
  const shown = useReveal(useInView(listRef, { skip: still }));

  return (
    <ul
      ref={listRef}
      // Preflight strips the markers, and with them the list role in Safari.
      role="list"
      aria-label={`${category.label} range`}
      className="md:grid md:grid-cols-2"
    >
      {category.products.map((product, i) => (
        // An odd one out at the end takes the whole line: no empty half-row beside it.
        <li key={product.slug} className="min-w-0 md:[&:last-child:nth-child(odd)]:col-span-2">
          <Link
            to={productHref(category, product)}
            data-cursor="open"
            className={cn(
              'group relative flex h-full min-h-11 items-baseline gap-6 py-5 text-foreground md:py-6',
              // The first of each pair keeps clear of the rule beside the head (lg) and
              // of its neighbour; the second keeps clear of the first.
              i % 2 === 0 ? 'md:pr-8 lg:pl-8' : 'md:pl-8'
            )}
          >
            <span aria-hidden="true" className={ROW_LINE} />
            <span
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-px origin-left bg-border"
              style={
                still
                  ? undefined
                  : {
                      transform: shown ? 'none' : 'scaleX(0)',
                      transition: revealTransition(shown, 'transform', 0.6, i * LINE_STAGGER),
                    }
              }
            />
            <span className={cn('display-sm min-w-0 flex-1', ROW_SHIFT)}>{product.name}</span>
            <ArrowTravel className={ARROW} />
          </Link>
        </li>
      ))}
    </ul>
  );
};

/**
 * "What We Export" — the About copy names the export range in a sentence; this
 * turns the same list into crawlable links, straight from src/content/products.ts.
 * Each category is a ruled 4/8 split: its name, line and onward links in the narrow
 * cell, the directory, two to a line, in the wide one — the two of about one height.
 */
const ExportRange = ({ className }: ExportRangeProps) => (
  <section aria-labelledby="export-range-heading" className={cn('bg-secondary/40', className)}>
    <div className={cn(WRAP, SECTION_Y)}>
      <SectionHead
        label={productsIntro.eyebrow}
        title={productsIntro.heading}
        italicWords={['Our']}
        id="export-range-heading"
      >
        <p className="lead">{productsIntro.short}</p>
      </SectionHead>

      {categories.map((category) => (
        <article key={category.slug} className="relative mt-12 grid border-t border-border md:mt-16 lg:grid-cols-12">
          <span aria-hidden="true" className="absolute inset-y-0 left-[33.333333%] hidden w-px bg-border lg:block" />

          {/* Below lg its bottom rule is the first row's top. */}
          <Reveal className="border-b border-border pb-8 pt-6 lg:col-span-4 lg:border-b-0 lg:pb-10 lg:pr-8 lg:pt-8">
            {/* No "Category 01" eyebrow: the numbering was decoration, and the name says it.
                Not a link: "View …" below goes to the same page with a full-size target. */}
            <h3 className="display-sm text-foreground">{category.title}</h3>
            <p className="mt-4 max-w-[44ch] text-secondary text-muted-foreground">{category.short}</p>
            <div className="mt-4 flex flex-col items-start">
              <Link to={`/products/${category.slug}`} data-cursor="open" className={TEXT_LINK}>
                <span className={GROUP_UNDERLINE}>View {category.label}</span>
                <ArrowTravel />
              </Link>
              <Link
                to={`/contact?product=${encodeURIComponent(category.label)}`}
                data-lead={`about-enquire-${category.slug}`}
                data-cursor="enquire"
                className={TEXT_LINK}
              >
                <span className={GROUP_UNDERLINE}>Enquire about {category.label}</span>
                <ArrowTravel direction="up-right" />
              </Link>
            </div>
          </Reveal>

          <div className="lg:col-span-8">
            <RangeList category={category} />
          </div>
        </article>
      ))}

      {/* The directory's closing row, not a boxed button. */}
      <Reveal className="mt-12 md:mt-16">
        <Link
          to="/products"
          data-cursor="open"
          className="group relative flex min-h-20 items-center justify-between gap-6 border-y border-border py-5 text-foreground md:min-h-24"
        >
          <span aria-hidden="true" className={ROW_LINE} />
          <span className={cn('display-sm', ROW_SHIFT)}>View the full product line</span>
          <ArrowTravel className={ARROW} />
        </Link>
      </Reveal>
    </div>
  </section>
);

export default ExportRange;
