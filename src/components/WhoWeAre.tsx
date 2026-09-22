import LazyImage from '@/components/LazyImage';
import Reveal from '@/components/Reveal';
import { RowLink, SectionHead } from '@/components/Ruled';
import ImageReveal from '@/components/motion/ImageReveal';
import SplitReveal from '@/components/motion/SplitReveal';
import { about } from '@/content/about';
import { heroImages } from '@/content/images';
import { hero, site } from '@/content/site';

// H2, the five-panel seed-to-smoke collage (owner, 2026-09-22): it left the hero, which
// is now a single still photograph, to stand here under the line it illustrates.
const photo = heroImages[1];

/**
 * "Who We Are" — the short company introduction that follows the hero (Orchid's
 * "manufacturing partner" blurb). The heading only restates the hero line; the body is
 * the workbook's hero paragraph and the first About paragraph, verbatim.
 *
 * Drawn like a plan, top to bottom inside one ruled block: the collage across the full
 * measure, then the two paragraphs side by side on one vertical hairline (they are
 * nearly the same length, so the halves end level and neither leaves a hole), then the
 * onward link as the block's closing row. No frames.
 *
 * The collage is five panels in a row — seed, field, curing barn, cured leaf, packs — so
 * it is shown whole, at its own aspect ratio: a frame of any other shape would cut into
 * the first and last panels. For the same reason it has no parallax (that needs a
 * picture larger than its frame); the reveal's unmasking and settle are its motion.
 */
const WhoWeAre = () => (
  <section aria-labelledby="who-we-are-heading" className="py-20 md:py-24 lg:py-28">
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <SectionHead label="Who We Are" />

      <SplitReveal
        as="h2"
        id="who-we-are-heading"
        by="line"
        text="Vertically integrated, from seed to smoke"
        italicWords={['integrated']}
        // 9em: the statement always breaks after the comma, at every width.
        className="display-lg mt-12 max-w-[9em] text-foreground md:mt-16 lg:mt-20"
      />

      <div className="mt-14 border-y border-border md:mt-20 lg:mt-24">
        {photo && (
          // bg-secondary is the surface the frame shows while the file is on its way.
          <ImageReveal className="bg-secondary">
            {/* The frame's height: the collage's own proportions (1920 × 1072), so nothing is cropped. */}
            <div aria-hidden="true" style={{ aspectRatio: `${photo.image.img.w} / ${photo.image.img.h}` }} />
            <LazyImage
              image={photo.image}
              alt={photo.alt}
              // The full container: 1232px from xl, the window less its gutters below that.
              sizes="(min-width: 1280px) 1232px, 100vw"
              className="absolute inset-0 h-full w-full object-cover"
              style={{ objectPosition: photo.position }}
            />
          </ImageReveal>
        )}

        <div className="grid border-t border-border lg:grid-cols-2">
          {/* Running copy at the body's own 17px: no size of its own to fall behind. */}
          <div className="pt-10 md:pt-12 lg:pb-12 lg:pr-10">
            <Reveal as="p" className="max-w-[38rem] text-foreground">
              {hero.body}
            </Reveal>
          </div>
          <div className="pb-10 pt-6 md:pb-12 lg:border-l lg:border-border lg:pl-10 lg:pt-12">
            <Reveal as="p" delay={0.08} className="max-w-[38rem] text-muted-foreground">
              {about.paragraphs[0]}
            </Reveal>
          </div>
        </div>

        <Reveal delay={0.16}>
          <RowLink to="/about-us">About {site.shortName}</RowLink>
        </Reveal>
      </div>
    </div>
  </section>
);

export default WhoWeAre;
