import { useId } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import ScrollTextReveal from '@/components/ScrollTextReveal';
import LazyImage from '@/components/LazyImage';
import Reveal from '@/components/Reveal';
import ProductCard from '@/components/ProductCard';
import FormatCard from '@/components/FormatCard';
import { cn } from '@/lib/utils';
import { categories, productsIntro, type ProductCategory } from '@/content/products';
import { categoryImages, productImages } from '@/content/images';

/** Same URL shape as <EnquiryCta product>, so the enquiry form opens pre-filled. */
const enquiryPath = (product: string) => `/contact?product=${encodeURIComponent(product)}`;

const CategoryCard = ({ category, index }: { category: ProductCategory; index: number }) => {
  const id = useId();
  const cover = categoryImages[category.slug];

  return (
    <Reveal as="article" delay={index * 0.12} className="h-full">
      <Link
        to={`/products/${category.slug}`}
        aria-labelledby={`${id}-title ${id}-cta`}
        aria-describedby={`${id}-short`}
        className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card transition-all duration-500 hover:border-accent/40 hover:shadow-2xl hover:shadow-accent/10 motion-safe:hover:-translate-y-1"
      >
        {cover && (
          // Square, not wider: the 3:4 cut-outs lose only empty backdrop at this crop.
          <div className="relative aspect-square overflow-hidden bg-tile">
            <LazyImage
              image={cover.image}
              alt={cover.alt}
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 480px"
              className="product-shot absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out motion-safe:group-hover:scale-105 motion-safe:group-focus-within:scale-105"
              style={{ objectPosition: cover.position }}
            />
          </div>
        )}
        <div className="flex flex-1 flex-col p-6 md:p-8">
          <p className="eyebrow">{category.eyebrow}</p>
          <h3
            id={`${id}-title`}
            className="mt-3 font-display text-2xl font-medium leading-tight text-foreground md:text-3xl"
          >
            {category.title}
          </h3>
          <p id={`${id}-short`} className="mt-3 leading-relaxed text-muted-foreground">
            {category.short}
          </p>
          <span
            id={`${id}-cta`}
            className="mt-auto inline-flex items-center gap-2 pt-6 text-xs font-medium uppercase tracking-[0.2em] text-accent"
          >
            View Range
            <ArrowRight
              aria-hidden="true"
              className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
            />
          </span>
        </div>
      </Link>
    </Reveal>
  );
};

/** Quiet label + hairline that separates the two catalogue grids. */
const GroupLabel = ({ children }: { children: string }) => (
  <Reveal className="flex items-center gap-5">
    <p className="eyebrow shrink-0">{children}</p>
    <span aria-hidden="true" className="h-px flex-1 bg-border" />
  </Reveal>
);

const ProductShowcase = () => {
  const { ref: headingRef, isVisible: headingVisible } = useScrollAnimation({ threshold: 0.5 });

  const leaf = categories.find((c) => c.slug === 'leaf-tobacco');
  const cigarettes = categories.find((c) => c.slug === 'finished-cigarettes');

  return (
    <section id="products" aria-labelledby="products-heading" className="bg-background py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div ref={headingRef} className="overflow-hidden text-center">
          {/* The reveal splits text into per-letter spans; hide those and label the real element. */}
          <div className="eyebrow">
            <span className="sr-only">{productsIntro.eyebrow}</span>
            <span aria-hidden="true">
              <ScrollTextReveal text={productsIntro.eyebrow} staggerDelay={25} />
            </span>
          </div>
          <h2
            id="products-heading"
            aria-label={productsIntro.heading}
            className="mt-4 overflow-hidden pb-1 font-display text-4xl font-medium leading-tight text-foreground md:text-6xl"
          >
            <span aria-hidden="true">
              <ScrollTextReveal text={productsIntro.heading} staggerDelay={40} threshold={0.2} />
            </span>
          </h2>
          <div
            aria-hidden="true"
            className={cn(
              'mx-auto mt-6 h-px bg-gold/70 transition-[width] delay-500 duration-1000 ease-out',
              headingVisible ? 'w-20' : 'w-0'
            )}
          />
        </div>

        <Reveal
          as="p"
          delay={0.15}
          className="mx-auto mt-8 max-w-3xl text-center text-base leading-relaxed text-muted-foreground md:text-lg"
        >
          {productsIntro.short}
        </Reveal>

        {/* The two categories */}
        <div className="mx-auto mt-14 grid max-w-5xl gap-6 md:mt-20 md:grid-cols-2 md:gap-10">
          {categories.map((category, i) => (
            <CategoryCard key={category.slug} category={category} index={i} />
          ))}
        </div>

        {/* Leaf catalogue: image + name, straight through to the product page */}
        {leaf && (
          <div className="mt-20 md:mt-28">
            <GroupLabel>{leaf.label}</GroupLabel>
            <ul className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
              {leaf.products.map((product, i) => (
                <li key={product.slug}>
                  <ProductCard
                    to={product.hasDetailPage ? `/products/${leaf.slug}/${product.slug}` : undefined}
                    image={productImages[product.slug]?.[0] ?? categoryImages[leaf.slug]}
                    name={product.name}
                    short={product.short}
                    eyebrow={leaf.label}
                    index={i % 4}
                  />
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Cigarette formats: no detail pages yet, so each card opens a pre-filled enquiry */}
        {cigarettes && (
          <div className="mt-20 md:mt-28">
            <GroupLabel>{cigarettes.label}</GroupLabel>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
              {cigarettes.products.map((product, i) => (
                <Reveal as="li" key={product.slug} delay={(i % 3) * 0.08} className="h-full">
                  <FormatCard
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

        <Reveal className="mt-16 text-center md:mt-20">
          <Link
            to="/products"
            className="group inline-flex min-h-12 items-center gap-3 rounded-md border border-foreground/25 px-8 text-xs font-semibold uppercase tracking-[0.2em] text-foreground transition-colors duration-300 hover:border-accent hover:text-accent"
          >
            All Products
            <ArrowRight
              aria-hidden="true"
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </Reveal>
      </div>
    </section>
  );
};

export default ProductShowcase;
