import { useId } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import LazyImage from '@/components/LazyImage';
import Reveal from '@/components/Reveal';
import SectionMarker from '@/components/SectionMarker';
import ProductCard from '@/components/ProductCard';
import FormatCard from '@/components/FormatCard';
import ImageReveal from '@/components/motion/ImageReveal';
import Magnetic from '@/components/motion/Magnetic';
import SplitReveal from '@/components/motion/SplitReveal';
import { cn } from '@/lib/utils';
import { categories, productsIntro, type ProductCategory } from '@/content/products';
import { categoryImages, productImages } from '@/content/images';

/** Same URL shape as <EnquiryCta product>, so the enquiry form opens pre-filled. */
const enquiryPath = (product: string) => `/contact?product=${encodeURIComponent(product)}`;

const two = (n: number) => String(n).padStart(2, '0');

// The pair is deliberately uneven: a wide, near-square lead and a narrower, taller
// second card that starts lower down the page. `sizes` follows the 7/5 column split.
const CARD_SHAPES = [
  {
    cell: 'lg:col-span-7',
    ratio: 'aspect-square lg:aspect-[8/7]',
    sizes: '(min-width: 1280px) 710px, (min-width: 1024px) 57vw, 100vw',
  },
  {
    cell: 'lg:col-span-5 lg:mt-40',
    ratio: 'aspect-[4/5]',
    sizes: '(min-width: 1280px) 500px, (min-width: 1024px) 40vw, 100vw',
  },
] as const;

const CategoryCard = ({ category, index }: { category: ProductCategory; index: number }) => {
  const id = useId();
  const cover = categoryImages[category.slug];
  const shape = CARD_SHAPES[index % CARD_SHAPES.length];
  const delay = index * 0.12;

  return (
    <article className={shape.cell}>
      <Link
        to={`/products/${category.slug}`}
        aria-labelledby={`${id}-title ${id}-cta`}
        aria-describedby={`${id}-short`}
        data-cursor="open"
        className="group block rounded-sm"
      >
        {cover && (
          <div className="relative">
            <ImageReveal delay={delay} className={cn('rounded-sm', shape.ratio)}>
              {/* The tile rides inside the reveal, so the cut-out keeps multiplying into it while the frame opens. */}
              <div className="absolute inset-0 bg-tile">
                <LazyImage
                  image={cover.image}
                  alt={cover.alt}
                  sizes={shape.sizes}
                  className="product-shot absolute inset-0 h-full w-full object-cover transition-transform [transition-duration:1200ms] ease-expo-out motion-safe:group-hover:scale-[1.04] motion-safe:group-focus-visible:scale-[1.04]"
                  style={{ objectPosition: cover.position }}
                />
              </div>
            </ImageReveal>
            {/* The tile is light in both themes, so the numeral takes the tile's ink, not the page's. */}
            <Reveal delay={delay + 0.35} className="pointer-events-none absolute left-5 top-3 text-tile-foreground md:left-8 md:top-5">
              <span
                aria-hidden="true"
                className="text-outline font-display text-[length:clamp(4.5rem,10vw,9rem)] font-normal leading-none tracking-[-0.04em]"
              >
                {two(index + 1)}
              </span>
            </Reveal>
          </div>
        )}

        <Reveal delay={delay + 0.15} className="pt-6 md:pt-8">
          <p className="eyebrow">{category.eyebrow}</p>
          <div className="mt-3 flex items-end justify-between gap-6">
            <h3
              id={`${id}-title`}
              className="text-[length:clamp(2rem,3.6vw,3.25rem)] font-normal leading-[1.05] tracking-[-0.025em] text-foreground"
            >
              {category.title}
            </h3>
            {/* One arrow leaves to the right as its twin arrives from the left. */}
            <span
              aria-hidden="true"
              className="relative mb-1.5 flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-foreground/20 text-foreground transition-colors duration-500 ease-expo-out group-hover:border-accent group-hover:text-accent"
            >
              <ArrowRight className="h-4 w-4 transition-transform duration-700 ease-expo-out group-hover:translate-x-[250%]" />
              <ArrowRight className="absolute h-4 w-4 -translate-x-[250%] transition-transform duration-700 ease-expo-out group-hover:translate-x-0" />
            </span>
          </div>
          <span aria-hidden="true" className="relative mt-6 block h-px bg-border">
            <span className="absolute inset-0 origin-left scale-x-0 bg-gold transition-transform duration-700 ease-expo-out group-hover:scale-x-100 group-focus-visible:scale-x-100" />
          </span>
          <p id={`${id}-short`} className="mt-5 max-w-md leading-relaxed text-muted-foreground">
            {category.short}
          </p>
          <span id={`${id}-cta`} className="sr-only">
            View Range
          </span>
        </Reveal>
      </Link>
    </article>
  );
};

/** Label, hairline and a count: what separates the two catalogue lists. */
const GroupLabel = ({ children, count }: { children: string; count: number }) => (
  <Reveal className="flex items-center gap-5">
    <p className="eyebrow shrink-0">{children}</p>
    <span aria-hidden="true" className="h-px flex-1 bg-border" />
    <p className="eyebrow shrink-0 tabular-nums text-muted-foreground">
      <span aria-hidden="true">({two(count)})</span>
      <span className="sr-only">{count} products</span>
    </p>
  </Reveal>
);

const ProductShowcase = () => {
  const leaf = categories.find((c) => c.slug === 'leaf-tobacco');
  const cigarettes = categories.find((c) => c.slug === 'finished-cigarettes');

  return (
    <section id="products" aria-labelledby="products-heading" className="bg-background py-24 md:py-32 lg:py-36">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Marker in the first columns, heading offset to the fifth */}
        <div className="grid gap-x-8 gap-y-8 lg:grid-cols-12 lg:items-baseline">
          <SectionMarker number="02" className="lg:col-span-4">
            {productsIntro.eyebrow}
          </SectionMarker>
          <div className="lg:col-span-8">
            <SplitReveal
              as="h2"
              id="products-heading"
              text={productsIntro.heading}
              className="text-[length:clamp(2.75rem,6.5vw,6rem)] font-normal leading-none tracking-[-0.035em] text-foreground"
            />
            <Reveal
              as="p"
              delay={0.15}
              className="mt-8 max-w-xl text-base leading-relaxed text-muted-foreground md:mt-10 md:text-lg"
            >
              {productsIntro.short}
            </Reveal>
          </div>
        </div>

        {/* The two categories */}
        <div className="mt-16 grid gap-x-8 gap-y-16 md:mt-24 lg:grid-cols-12 lg:items-start">
          {categories.map((category, i) => (
            <CategoryCard key={category.slug} category={category} index={i} />
          ))}
        </div>

        {/* Leaf catalogue: image + name, straight through to the product page */}
        {leaf && (
          <div className="mt-24 md:mt-36">
            <GroupLabel count={leaf.products.length}>{leaf.label}</GroupLabel>
            <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 md:gap-y-16 lg:grid-cols-4 lg:gap-x-8">
              {leaf.products.map((product, i) => (
                <li key={product.slug}>
                  <ProductCard
                    to={product.hasDetailPage ? `/products/${leaf.slug}/${product.slug}` : undefined}
                    image={productImages[product.slug]?.[0] ?? categoryImages[leaf.slug]}
                    name={product.name}
                    short={product.short}
                    index={i}
                    number={i + 1}
                  />
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Cigarette formats: no detail pages yet, so each entry opens a pre-filled enquiry */}
        {cigarettes && (
          <div className="mt-24 md:mt-36">
            <GroupLabel count={cigarettes.products.length}>{cigarettes.label}</GroupLabel>
            <ul className="mt-10 border-b border-border">
              {cigarettes.products.map((product, i) => (
                <Reveal as="li" key={product.slug} delay={Math.min(i, 3) * 0.07}>
                  <FormatCard
                    layout="row"
                    number={i + 1}
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

        <Reveal className="mt-16 flex sm:justify-end md:mt-20">
          <Magnetic>
            <Link
              to="/products"
              data-cursor="open"
              className="group inline-flex min-h-14 items-center gap-4 rounded-md border border-foreground/25 px-9 text-xs font-semibold uppercase tracking-[0.2em] text-foreground transition-colors duration-500 ease-expo-out hover:border-accent hover:text-accent"
            >
              All Products
              <ArrowRight
                aria-hidden="true"
                className="h-4 w-4 transition-transform duration-500 ease-expo-out group-hover:translate-x-1.5"
              />
            </Link>
          </Magnetic>
        </Reveal>
      </div>
    </section>
  );
};

export default ProductShowcase;
