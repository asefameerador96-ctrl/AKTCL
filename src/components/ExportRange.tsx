import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Reveal from '@/components/Reveal';
import {
  categories,
  productsIntro,
  type Product,
  type ProductCategory,
} from '@/content/products';
import { cn } from '@/lib/utils';

interface ExportRangeProps {
  className?: string;
}

/**
 * Products with one line of copy have no page of their own (hasDetailPage: false);
 * their chip goes to the category page, which is where they are described.
 */
const productHref = (category: ProductCategory, product: Product) =>
  product.hasDetailPage
    ? `/products/${category.slug}/${product.slug}`
    : `/products/${category.slug}`;

const TEXT_LINK =
  'inline-flex min-h-11 items-center gap-2 text-sm font-medium uppercase tracking-[0.15em] text-accent transition-colors hover:text-foreground';

/**
 * "What We Export" — the About copy names the export range in a sentence; this
 * turns the same list into crawlable links, straight from src/content/products.ts.
 */
const ExportRange = ({ className }: ExportRangeProps) => (
  <section
    aria-labelledby="export-range-heading"
    className={cn('bg-secondary/50 py-20 md:py-28', className)}
  >
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <Reveal className="max-w-3xl">
        <p className="eyebrow">{productsIntro.eyebrow}</p>
        <h2
          id="export-range-heading"
          className="mt-4 text-3xl/tight font-medium md:text-4xl/tight lg:text-5xl/tight"
        >
          {productsIntro.heading}
        </h2>
        <div className="rule mt-6" aria-hidden="true" />
        <p className="mt-8 text-base/relaxed text-muted-foreground md:text-lg/relaxed">
          {productsIntro.short}
        </p>
      </Reveal>

      <div className="mt-12 grid gap-6 md:mt-16 lg:grid-cols-2 lg:gap-8">
        {categories.map((category, i) => (
          <Reveal
            as="article"
            key={category.slug}
            delay={i * 0.12}
            className="flex flex-col rounded-lg border border-border bg-card p-6 sm:p-8 lg:p-10"
          >
            <p className="eyebrow">{category.eyebrow}</p>
            {/* Not a link: "View …" below goes to the same page with a full-size target. */}
            <h3 className="mt-3 text-2xl/snug font-medium md:text-3xl/snug">{category.title}</h3>
            <p className="mt-4 leading-relaxed text-muted-foreground">{category.short}</p>

            <ul
              // Preflight strips the markers, and with them the list role in Safari.
              role="list"
              aria-label={`${category.label} range`}
              className="mt-8 flex flex-wrap gap-2.5"
            >
              {category.products.map((product) => (
                <li key={product.slug}>
                  <Link
                    to={productHref(category, product)}
                    className="inline-flex min-h-11 items-center rounded-full border border-border bg-background px-4 text-sm font-medium transition-colors hover:border-accent hover:text-accent"
                  >
                    {product.name}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Stacked, not wrapped: the two labels differ in length per card, and
                wrapping would break the cards' footers at different widths. */}
            <div className="mt-auto pt-8">
              <div className="flex flex-col items-start border-t border-border pt-4">
                <Link to={`/products/${category.slug}`} className={TEXT_LINK}>
                  View {category.label}
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
                <Link
                  to={`/contact?product=${encodeURIComponent(category.label)}`}
                  data-lead={`about-enquire-${category.slug}`}
                  className={TEXT_LINK}
                >
                  Enquire about {category.label}
                </Link>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-10 md:mt-12">
        <Link to="/products" className={TEXT_LINK}>
          View the full product line
          <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </Link>
      </Reveal>
    </div>
  </section>
);

export default ExportRange;
