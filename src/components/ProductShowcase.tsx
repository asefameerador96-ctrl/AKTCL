import { useId } from 'react';
import { Link } from 'react-router-dom';
import LazyImage from '@/components/LazyImage';
import Reveal from '@/components/Reveal';
import ProductCard from '@/components/ProductCard';
import FormatCard from '@/components/FormatCard';
import { RowLink, SectionHead, TravelArrow } from '@/components/Ruled';
import ImageReveal from '@/components/motion/ImageReveal';
import SplitReveal from '@/components/motion/SplitReveal';
import { cn } from '@/lib/utils';
import { categories, productsIntro, type Product, type ProductCategory } from '@/content/products';
import { categoryImages, productImages } from '@/content/images';

/** Same URL shape as <EnquiryCta product>, so the enquiry form opens pre-filled. */
const enquiryPath = (product: string) => `/contact?product=${encodeURIComponent(product)}`;

// The pair is an even split, 50/50 on one vertical hairline (owner, 2026-09-22: two
// pictures side by side always share the width equally). The two tiles are one shape,
// square beside square, so they stand level and the rule under them runs straight
// across both cells. The cut-outs are shot 3:4 with the subject in the middle half, so a
// square cover-crop only trims empty sweep. Stacked on a phone, the tile is no wider
// than 6:5: the portrait cut-outs lose their tips beyond that.
const CELL = {
  ratio: 'aspect-square sm:aspect-[6/5] md:aspect-square',
  // Half the 1232px container from xl, half the window from md, the window below.
  sizes: '(min-width: 1280px) 616px, (min-width: 768px) 50vw, 100vw',
} as const;

/**
 * One category as a CELL of the ruled split: tile flush to the rules, title, one line,
 * and a ruled-off "View Range" row. The whole cell is the link; hover is the
 * catalogue's — the tile darkens, the title's underline is drawn, the arrow travels.
 * No card chrome, and no "Category 01" eyebrow: a number that says nothing.
 */
const CategoryCell = ({ category, index }: { category: ProductCategory; index: number }) => {
  const id = useId();
  const cover = categoryImages[category.slug];
  const delay = index * 0.12;

  return (
    <article>
      <Link
        to={`/products/${category.slug}`}
        aria-labelledby={`${id}-title ${id}-cta`}
        aria-describedby={`${id}-short`}
        data-cursor="open"
        // Raised while focused: the ring is drawn outside the cell, over its neighbour's tile.
        className="group relative flex h-full flex-col focus-visible:z-10"
      >
        {cover && (
          <ImageReveal delay={delay} className={CELL.ratio}>
            {/* The tile rides inside the reveal, so the cut-out keeps multiplying into it while the frame opens. */}
            <div className="absolute inset-0 bg-tile">
              <LazyImage
                image={cover.image}
                alt={cover.alt}
                sizes={CELL.sizes}
                className="product-shot absolute inset-0 h-full w-full object-cover"
                style={{ objectPosition: cover.position }}
              />
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-tile-foreground opacity-0 transition-opacity group-hover:opacity-[0.04] group-focus-visible:opacity-[0.04]"
              />
            </div>
          </ImageReveal>
        )}

        <Reveal delay={delay + 0.15} className="flex flex-1 flex-col border-t border-border">
          <div className="flex-1 px-4 pb-10 pt-6 sm:px-6 md:pb-14 md:pt-8 lg:px-8">
            <h3 id={`${id}-title`} className="display-md text-foreground">
              <span className="link-underline pb-1 group-hover:[background-position:0%_100%] group-hover:[background-size:100%_1px] group-focus-visible:[background-position:0%_100%] group-focus-visible:[background-size:100%_1px]">
                {category.title}
              </span>
            </h3>
            <p id={`${id}-short`} className="text-secondary mt-5 max-w-md text-muted-foreground">
              {category.short}
            </p>
          </div>
          <p
            id={`${id}-cta`}
            className="mono-label flex min-h-14 items-center justify-between gap-6 border-t border-border px-4 text-foreground sm:px-6 lg:px-8"
          >
            View Range
            <TravelArrow className="transition-colors group-hover:text-accent group-focus-visible:text-accent" />
          </p>
        </Reveal>
      </Link>
    </article>
  );
};

/** The mono label that names a catalogue list (no count); the grid or directory beneath supplies the rule. */
const GroupLabel = ({ children }: { children: string }) => (
  <Reveal as="p" from="none" className="eyebrow pb-4">
    {children}
  </Reveal>
);

/** A cigarette line's own page where it has one, otherwise a pre-filled enquiry. */
const cigaretteLink = (category: ProductCategory, product: Product) =>
  product.hasDetailPage ? `/products/${category.slug}/${product.slug}` : enquiryPath(product.name);

/**
 * "What We Export" — the catalogue, drawn rather than boxed: an even ruled split for the
 * two categories, a hairline grid of leaf cells (their borders shared), and the
 * cigarette formats as directory rows. Everything is one step from a product page or
 * a pre-filled enquiry.
 *
 * No top padding: it follows "Who We Are" on the same paper, whose own bottom padding
 * makes the gap (two paddings stacked would leave a band of nothing between them).
 */
const ProductShowcase = () => {
  const leaf = categories.find((c) => c.slug === 'leaf-tobacco');
  const cigarettes = categories.find((c) => c.slug === 'finished-cigarettes');

  return (
    <section id="products" aria-labelledby="products-heading" className="bg-background pb-20 md:pb-24 lg:pb-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHead label={productsIntro.eyebrow} />

        {/* Headline over the one cell, lead over the other: the split below starts here. */}
        <div className="mt-12 grid gap-y-8 md:mt-16 lg:mt-20 lg:grid-cols-2 lg:items-end">
          <SplitReveal
            as="h2"
            id="products-heading"
            text={productsIntro.heading}
            italicWords={['Our']}
            className="display-lg text-foreground lg:pr-8"
          />
          <Reveal as="p" delay={0.15} className="lead lg:pb-2 lg:pl-8">
            {productsIntro.short}
          </Reveal>
        </div>

        {/* The two categories, half and half */}
        <div className="hairline-grid mt-14 grid md:mt-20 md:grid-cols-2">
          {categories.map((category, i) => (
            <CategoryCell key={category.slug} category={category} index={i} />
          ))}
        </div>

        {/* Leaf catalogue: image + name, straight through to the product page */}
        {leaf && (
          <div className="mt-24 md:mt-32">
            <GroupLabel>{leaf.label}</GroupLabel>
            <ul role="list" className="hairline-grid grid grid-cols-2 lg:grid-cols-4">
              {leaf.products.map((product, i) => (
                <li key={product.slug}>
                  <ProductCard
                    to={product.hasDetailPage ? `/products/${leaf.slug}/${product.slug}` : undefined}
                    image={productImages[product.slug]?.[0] ?? categoryImages[leaf.slug]}
                    name={product.name}
                    short={product.short}
                    index={i}
                  />
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Cigarette lines: a row with a page of its own (AKT Signature Collection) opens
            it; the rest, which have none yet, open a pre-filled enquiry. */}
        {cigarettes && (
          <div className="mt-24 md:mt-32">
            <GroupLabel>{cigarettes.label}</GroupLabel>
            <ul role="list">
              {cigarettes.products.map((product, i) => (
                <Reveal as="li" key={product.slug} delay={Math.min(i, 3) * 0.07}>
                  <FormatCard
                    layout="row"
                    name={product.name}
                    short={product.short}
                    rows={product.specs}
                    to={cigaretteLink(cigarettes, product)}
                  />
                </Reveal>
              ))}
            </ul>
          </div>
        )}

        {/* The directory's closing row, not a boxed button. */}
        <Reveal className={cn(!cigarettes && 'mt-24 md:mt-32')}>
          <RowLink to="/products" display className="border-b">
            All Products
          </RowLink>
        </Reveal>
      </div>
    </section>
  );
};

export default ProductShowcase;
