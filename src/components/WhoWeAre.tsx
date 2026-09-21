import LazyImage from '@/components/LazyImage';
import Reveal from '@/components/Reveal';
import { RowLink, SectionHead } from '@/components/Ruled';
import ImageReveal from '@/components/motion/ImageReveal';
import Parallax from '@/components/motion/Parallax';
import SplitReveal from '@/components/motion/SplitReveal';
import { about } from '@/content/about';
import { journeyImages } from '@/content/images';
import { hero, site } from '@/content/site';

// The threshing floor: real plant, real people — the strongest "who we are" frame.
const photo = journeyImages.process?.[0];

/**
 * "Who We Are" — the short company introduction that follows the hero (Orchid's
 * "manufacturing partner" blurb), set as an editorial 5/7 split. The heading only
 * restates the hero line; the body is the workbook's hero paragraph and the first
 * About paragraph, verbatim.
 *
 * Drawn like a plan: the copy runs down the narrow column under the headline, one
 * vertical hairline parts it from the photograph, which fills its cell to the rules
 * on every side, and the onward link is the copy column's closing row. No frames.
 */
const WhoWeAre = () => (
  <section aria-labelledby="who-we-are-heading" className="py-24 md:py-32 lg:py-36">
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <SectionHead number="01" label="Who We Are" meta={`${site.parent} · ${site.country}`} />

      <SplitReveal
        as="h2"
        id="who-we-are-heading"
        by="line"
        text="Vertically integrated, from seed to smoke"
        italicWords={['integrated']}
        // 9em: the statement always breaks after the comma, at every width.
        className="display-lg mt-12 max-w-[9em] text-foreground md:mt-16 lg:mt-20"
      />

      <div className="mt-14 grid border-y border-border md:mt-20 lg:mt-24 lg:grid-cols-12">
        {photo && (
          // First in the DOM (photograph, then copy, on phones), second on the desktop
          // row, where the grid stretches the frame to the height of the copy.
          <ImageReveal className="bg-secondary lg:col-span-7 lg:col-start-6 lg:row-start-1">
            {/* The frame's floor: the photograph's own 4:3. */}
            <div aria-hidden="true" className="aspect-[4/3]" />
            {/* Taller than its frame by the distance the parallax travels. */}
            <Parallax speed={0.06} className="absolute inset-x-0 -inset-y-[10%]">
              <LazyImage
                image={photo.image}
                alt={photo.alt}
                // Cover-cropped into a box a fifth taller than the frame: 7 of 12 columns from lg up.
                sizes="(min-width: 1280px) 860px, (min-width: 1024px) 70vw, 120vw"
                className="absolute inset-0 h-full w-full object-cover"
                style={{ objectPosition: photo.position }}
              />
            </Parallax>
          </ImageReveal>
        )}

        <div className="flex flex-col lg:col-span-5 lg:col-start-1 lg:row-start-1 lg:border-r lg:border-border">
          <div className="max-w-[60ch] py-10 md:py-12 lg:pr-10">
            <Reveal as="p" className="text-base leading-relaxed text-foreground">
              {hero.body}
            </Reveal>
            <Reveal as="p" delay={0.08} className="mt-6 text-base leading-relaxed text-muted-foreground">
              {about.paragraphs[0]}
            </Reveal>
          </div>
          <Reveal delay={0.16} className="mt-auto">
            <RowLink to="/about-us" className="lg:pr-10">
              About {site.shortName}
            </RowLink>
          </Reveal>
        </div>
      </div>
    </div>
  </section>
);

export default WhoWeAre;
