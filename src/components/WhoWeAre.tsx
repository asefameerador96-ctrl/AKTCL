import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import LazyImage from '@/components/LazyImage';
import Reveal from '@/components/Reveal';
import { about } from '@/content/about';
import { journeyImages } from '@/content/images';
import { hero, site } from '@/content/site';

// The threshing floor: real plant, real people — the strongest "who we are" frame.
const photo = journeyImages.process?.[0];

/**
 * "Who We Are" — the short company introduction that follows the hero (Orchid's
 * "manufacturing partner" blurb). The heading only restates the hero line; the body
 * is the workbook's hero paragraph and the first About paragraph, verbatim.
 */
const WhoWeAre = () => (
  <section aria-labelledby="who-we-are-heading" className="py-20 md:py-28">
    <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:gap-20">
      <Reveal className="lg:col-span-6">
        <p className="eyebrow">Who We Are</p>
        <h2
          id="who-we-are-heading"
          className="mt-4 text-3xl font-medium leading-tight md:text-4xl lg:text-5xl"
        >
          Vertically integrated, from seed to smoke
        </h2>
        <div className="rule mt-6" aria-hidden="true" />
        <p className="mt-8 text-base leading-relaxed text-foreground md:text-lg">{hero.body}</p>
        <p className="mt-5 leading-relaxed text-muted-foreground">{about.paragraphs[0]}</p>
        <Link
          to="/about-us"
          className="mt-8 inline-flex min-h-11 items-center gap-2 text-sm font-medium uppercase tracking-[0.15em] text-accent transition-colors hover:text-foreground"
        >
          About {site.shortName}
          <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </Link>
      </Reveal>

      {photo && (
        // Travels up, not in from the side: a sideways offset would overflow the
        // page horizontally on phones while the image is still hidden.
        <Reveal delay={0.12} className="relative lg:col-span-6">
          <span
            aria-hidden="true"
            className="absolute -bottom-4 -right-4 hidden h-full w-full rounded-md border border-gold/50 lg:block"
          />
          <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-secondary lg:aspect-[4/5]">
            <LazyImage
              image={photo.image}
              alt={photo.alt}
              // Cover-cropping a 4:3 photo into the 4:5 desktop frame draws it
              // ~1.67 × the frame's width: 77vw for a ~46vw column, 960px once the
              // max-w-7xl shell stops growing.
              sizes="(min-width: 1280px) 960px, (min-width: 1024px) 77vw, 100vw"
              className="absolute inset-0 h-full w-full object-cover"
              style={{ objectPosition: photo.position }}
            />
          </div>
        </Reveal>
      )}
    </div>
  </section>
);

export default WhoWeAre;
