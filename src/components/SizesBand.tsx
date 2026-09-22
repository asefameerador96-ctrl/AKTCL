import Reveal from '@/components/Reveal';
import { RowLink, SectionHead } from '@/components/Ruled';
import SplitReveal from '@/components/motion/SplitReveal';
import RodLineUp from '@/components/sizes/RodLineUp';
import { sizesIntro } from '@/content/sizes';

/**
 * "Cigarette Sizes" on the homepage, straight after the catalogue: the ruled section
 * opener, a short headline (UI microcopy) with the segment's one owner-approved line
 * under it, and the formats' line-up drawn to one scale — each row a link to its size
 * page, with the format's tagline under its name — closed by a directory row to
 * /cigarette-sizes. Kept to about one screen.
 *
 * In the eager homepage bundle, so nothing heavy: the line-up is inline SVG and the
 * rest is the homepage's own ruled kit. No top padding: it follows ProductShowcase on
 * the same paper, whose own bottom padding makes the gap.
 *
 * Parked (owner, 2026-09-22): the homepage renders it only while
 * FEATURES.cigaretteSizes is on (src/content/features.ts). Kept as it was, ready to go
 * live again with the flag.
 */
const SizesBand = () => (
  <section id="cigarette-sizes" aria-labelledby="sizes-heading" className="bg-background pb-24 md:pb-32 lg:pb-36">
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <SectionHead label={sizesIntro.eyebrow} />

      <div className="mt-12 grid gap-y-12 md:mt-16 lg:mt-20 lg:grid-cols-12">
        <div className="lg:col-span-5 lg:pr-10">
          <SplitReveal
            as="h2"
            id="sizes-heading"
            text="Every format, one line"
            className="display-md max-w-[12ch] text-foreground"
          />
          {sizesIntro.lead && (
            <Reveal as="p" delay={0.15} className="text-secondary mt-6 max-w-sm text-muted-foreground md:mt-8">
              {sizesIntro.lead}
            </Reveal>
          )}
        </div>

        <RodLineUp compact linked taglines className="lg:col-span-7" />
      </div>

      <Reveal className="mt-14 md:mt-20">
        <RowLink to="/cigarette-sizes" display className="border-b">
          Explore Cigarette Sizes
        </RowLink>
      </Reveal>
    </div>
  </section>
);

export default SizesBand;
