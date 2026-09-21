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
import { categories, productsIntro, type ProductCategory } from '@/content/products';
import { categoryImages, productImages } from '@/content/images';

/** Same URL shape as <EnquiryCta product>, so the enquiry form opens pre-filled. */
const enquiryPath = (product: string) => `/contact?product=${encodeURIComponent(product)}`;

// The pair is a 7/5 split sharing one vertical hairline. Both tiles are six twelfths
// tall (7:6 beside 5:6), so the rule under them runs straight across the two cells.
// Stacked, they are no wider than 6:5: the portrait cut-outs lose their tips beyond that.
const CELL_SHAPES = [
  {
    cell: 'md:col-span-7',
    ratio: 'aspect-square sm:aspect-[6/5] md:aspect-[7/6]',
    sizes: '(min-width: 1280px) 720px, (min-width: 768px) 58vw, 100vw',
  },
  {
    cell: 'md:col-span-5',
    ratio: 'aspect-square sm:aspect-[6/5] md:aspect-[5/6]',
    sizes: '(min-width: 1280px) 515px, (min-width: 768px) 42vw, 100vw',
  },
] as const;

/**
 * One category as a CELL of the ruled split: tile flush to the rules, title, one line,
 * and a ruled-off "View Range" row. The whole cell is the link; hover is the
 * catalogue's — the tile darkens, the title's underline is drawn, the arrow travels.
 * No card chrome, and no "Category 01" eyebrow: a number that says nothing.
 */
const CategoryCell = ({ category, index }: { category: ProductCategory; index: number }) => {
  const id = useId();
  const cover = categoryImages[category.slug];
  const shape = CELL_SHAPES[index % CELL_SHAPES.length];
  const delay = index * 0.12;

  return (
    <article className={shape.cell}>
      <Link
        to={`/products/${category.slug}`}
        aria-labelledby={`${id}-title ${id}-cta`}
        aria-describedby={`${id}-short`}
        data-cursor="open"
        // Raised while focused: the ring is drawn outside the cell, over its neighbour's tile.
        className="group relative flex h-full flex-col focus-visible:z-10"
      >
        {cover && (
          <ImageReveal delay={delay} className={shape.ratio}>
            {/* The tile rides inside the reveal, so the cut-out keeps multiplying into it while the frame opens. */}
            <div className="absolute inset-0 bg-tile">
              <LazyImage
                image={cover.image}
                alt={cover.alt}
                sizes={shape.sizes}
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

/**
 * "What We Export" — the catalogue, drawn rather than boxed: a ruled 7/5 split for the
 * two categories, a hairline grid of leaf cells (their borders shared), and the
 * cigarette formats as directory rows. Everything is one step from a product page or
 * a pre-filled enquiry.
 */
const ProductShowcase = () => {
  const leaf = categories.find((c) => c.slug === 'leaf-tobacco');
  const cigarettes = categories.find((c) => c.slug === 'finished-cigarettes');

  return (
    <section id="products" aria-labelledby="products-heading" className="bg-background py-24 md:py-32 lg:py-36">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHead label={productsIntro.eyebrow} />

        {/* Headline over the wide cell, lead over the narrow one: the split below starts here. */}
        <div className="mt-12 grid gap-y-8 md:mt-16 lg:mt-20 lg:grid-cols-12 lg:items-end">
          <SplitReveal
            as="h2"
            id="products-heading"
            text={productsIntro.heading}
            italicWords={['Our']}
            className="display-lg text-foreground lg:col-span-7 lg:pr-8"
          />
          <Reveal as="p" delay={0.15} className="lead lg:col-span-5 lg:pb-2 lg:pl-8">
            {productsIntro.short}
          </Reveal>
        </div>

        {/* The two categories */}
        <div className="hairline-grid mt-14 grid md:mt-20 md:grid-cols-12">
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

        {/* Cigarette formats: no detail pages yet, so each row opens a pre-filled enquiry */}
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
                    to={enquiryPath(product.name)}
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
