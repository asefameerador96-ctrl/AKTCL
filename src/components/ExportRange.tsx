import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Reveal from '@/components/Reveal';
import {
  ArrowTravel,
  DISPLAY_H2,
  DrawnRule,
  GROUP_UNDERLINE,
  LABEL,
  TEXT_LINK,
} from '@/components/PageHeader';
import SplitReveal from '@/components/motion/SplitReveal';
import {
  categories,
  productsIntro,
  type Product,
  type ProductCategory,
} from '@/content/products';
import { EASE, isStill, useInView, useReveal } from '@/lib/motion';
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

const pad = (n: number) => String(n).padStart(2, '0');

/** Seconds between one row's hairline starting to draw and the next. */
const LINE_STAGGER = 0.06;

/**
 * One category as an oversized ruled list: a number, the product's name in the
 * display serif, an arrow that arrives on hover. The row IS the link and carries
 * .link-underline itself, so on hover or focus its resting hairline is inked over,
 * left to right, in the text colour. Hairlines draw in once, when the list is seen.
 */
const RangeList = ({ category }: { category: ProductCategory }) => {
  const [still] = useState(isStill);
  const listRef = useRef<HTMLUListElement>(null);
  const shown = useReveal(useInView(listRef, { skip: still }));

  const hairline = (i: number, edge: 'top' | 'bottom' = 'top') => (
    <span
      aria-hidden="true"
      className={cn('absolute inset-x-0 h-px origin-left bg-border', edge === 'top' ? 'top-0' : 'bottom-0')}
      style={
        still
          ? undefined
          : {
              transform: shown ? 'none' : 'scaleX(0)',
              transition: `transform 1.1s ${EASE.expoOut} ${(i * LINE_STAGGER).toFixed(2)}s`,
            }
      }
    />
  );

  return (
    <ul
      ref={listRef}
      // Preflight strips the markers, and with them the list role in Safari.
      role="list"
      aria-label={`${category.label} range`}
    >
      {category.products.map((product, i) => (
        <li key={product.slug} className="relative">
          {hairline(i)}
          {i === category.products.length - 1 && hairline(i + 1, 'bottom')}
          <Link
            to={productHref(category, product)}
            data-cursor="open"
            className="link-underline group relative flex min-h-11 items-baseline gap-5 py-4 text-foreground transition-colors duration-500 ease-expo-out hover:text-accent focus-visible:text-accent md:gap-8 md:py-5"
          >
            <span aria-hidden="true" className={cn(LABEL, 'w-6 shrink-0 tabular-nums text-inherit opacity-60')}>
              {pad(i + 1)}
            </span>
            <span className="min-w-0 flex-1 font-display text-[length:clamp(1.625rem,3.4vw,3rem)] font-normal leading-[1.08] tracking-[-0.025em] transition-transform duration-700 ease-expo-out group-hover:translate-x-2 group-focus-visible:translate-x-2">
              {product.name}
            </span>
            <ArrowTravel className="h-5 w-5 self-center opacity-0 transition-opacity duration-500 ease-expo-out group-hover:opacity-100 group-focus-visible:opacity-100 md:h-6 md:w-6" />
          </Link>
        </li>
      ))}
    </ul>
  );
};

/**
 * "What We Export" — the About copy names the export range in a sentence; this
 * turns the same list into crawlable links, straight from src/content/products.ts.
 */
const ExportRange = ({ className }: ExportRangeProps) => (
  <section
    aria-labelledby="export-range-heading"
    className={cn('border-t border-border bg-secondary/40 py-24 md:py-36', className)}
  >
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="grid items-end gap-x-16 gap-y-8 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <Reveal as="p" from="none" className="eyebrow">
            {productsIntro.eyebrow}
          </Reveal>
          <SplitReveal
            as="h2"
            id="export-range-heading"
            text={productsIntro.heading}
            italicWords={['Our']}
            className={cn('mt-4', DISPLAY_H2)}
          />
        </div>
        <Reveal
          as="p"
          delay={0.15}
          className="max-w-2xl text-base/relaxed text-muted-foreground md:text-lg/relaxed lg:col-span-6"
        >
          {productsIntro.short}
        </Reveal>
      </div>
      <DrawnRule className="mt-10 md:mt-14" delay={0.15} />

      {categories.map((category) => (
        <article
          key={category.slug}
          className="mt-16 grid gap-x-16 gap-y-10 md:mt-24 lg:grid-cols-12"
        >
          {/* Holds beside its list while the rows scroll past. */}
          <Reveal className="lg:sticky lg:top-28 lg:col-span-4 lg:self-start">
            <p className="eyebrow">{category.eyebrow}</p>
            {/* Not a link: "View …" below goes to the same page with a full-size target. */}
            <h3 className="mt-3 font-display text-3xl/[1.08] font-normal tracking-[-0.02em] text-foreground md:text-4xl/[1.08]">
              {category.title}
            </h3>
            <p className="mt-4 max-w-[44ch] leading-relaxed text-muted-foreground">{category.short}</p>
            <div className="mt-5 flex flex-col items-start">
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

      <Reveal className="mt-14 md:mt-20">
        <Link to="/products" data-cursor="open" className={TEXT_LINK}>
          <span className={GROUP_UNDERLINE}>View the full product line</span>
          <ArrowTravel />
        </Link>
      </Reveal>
    </div>
  </section>
);

export default ExportRange;
