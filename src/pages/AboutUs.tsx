import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import PageLayout from '@/components/PageLayout';
import PageHeader, {
  ArrowTravel,
  BODY,
  DrawnRule,
  GROUP_UNDERLINE,
  SectionHead,
  TEXT_LINK,
  WRAP,
} from '@/components/PageHeader';
import LazyImage from '@/components/LazyImage';
import Reveal from '@/components/Reveal';
import SectionMarker from '@/components/SectionMarker';
import HeritageTimeline from '@/components/HeritageTimeline';
import ExportRange from '@/components/ExportRange';
import Grain from '@/components/motion/Grain';
import ImageReveal from '@/components/motion/ImageReveal';
import Parallax from '@/components/motion/Parallax';
import SplitReveal from '@/components/motion/SplitReveal';
import { site } from '@/content/site';
import { about, facts, formatFact, type Fact } from '@/content/about';
import { journey, journeyBySlug, journeyIntro } from '@/content/journey';
import { journeyImages } from '@/content/images';
import { ROUTE_BY_PATH } from '@/seo/routeMeta';
import { cn } from '@/lib/utils';

const route = ROUTE_BY_PATH['/about-us'];

/** The tall photo beside the copy, and the two stages shown in the image pair. */
const STORY_STAGE = 'harvest';
const PAIR_STAGES = ['process', 'manufacture'];

const pad = (n: number) => String(n).padStart(2, '0');

/** Pairs a journey stage with its cover photo; drops the slug if either is missing. */
const stageWithCover = (slug: string) => {
  const stage = journeyBySlug(slug);
  const cover = journeyImages[slug]?.[0];
  return stage && cover ? [{ stage, cover, number: journey.indexOf(stage) + 1 }] : [];
};

// Final values, no count-up: the homepage animates these figures, here they are read.
const figure = (fact: Fact) => `${formatFact(fact)}${fact.suffix ?? ''}`;

// One ruled row from lg, each cell as wide as its figure is long (plus one for the
// gutter), so "50,000+" gets more room than "1953". Below lg the cells stack.
const FACT_COLUMNS = facts.map((fact) => `minmax(0, ${figure(fact).length + 1}fr)`).join(' ');

// A photograph inside a Parallax needs bleed to cover its travel: scale-110, at rest.
const DRIFTING_PHOTO = 'absolute inset-0 h-full w-full scale-110 object-cover';
// A linked photograph answers hover and focus like the catalogue's cells: it darkens a
// few per cent (opacity only), the title's underline is drawn, the arrow travels.
const PHOTO_HOVER =
  'pointer-events-none absolute inset-0 bg-ink opacity-0 transition-opacity group-hover:opacity-10 group-focus-visible:opacity-10';

// The pair is a 7/5 split sharing one vertical hairline. Both photographs are 5.25
// twelfths tall (4:3 beside 20:21), so the rule under them runs straight across.
const PAIR_SHAPES = [
  {
    cell: 'lg:col-span-7',
    ratio: 'aspect-[4/3]',
    sizes: '(min-width: 1280px) 720px, (min-width: 1024px) 58vw, calc(100vw - 32px)',
  },
  {
    cell: 'lg:col-span-5',
    ratio: 'aspect-[4/3] lg:aspect-[20/21]',
    sizes: '(min-width: 1280px) 514px, (min-width: 1024px) 42vw, calc(100vw - 32px)',
  },
] as const;

/*
 * TODO(Asef): sections deliberately NOT built because AKTCL has not supplied the
 * content — add each one only when real copy/assets arrive, never with placeholders:
 *   - Leadership (names, roles, portraits, chairman's message)
 *   - Certifications and quality standards (certificates, issuing bodies, dates)
 *   - Awards and press
 *   - CSR / sustainability and farmer programmes
 *   - Capacity (GLT and cigarette-making volumes, facilities, headcount)
 *   - Export markets (countries or regions served)
 */
const AboutUs = () => {
  const [lead, ...paragraphs] = about.paragraphs;
  const [story] = stageWithCover(STORY_STAGE);
  const pair = PAIR_STAGES.flatMap(stageWithCover);

  return (
    <PageLayout>
      <PageHeader breadcrumbs={route.breadcrumbs} eyebrow={about.heading} title={site.name} meta={site.country} />

      {/* 1 — The About copy, verbatim. Its first paragraph hangs from the masthead's
          closing rule as a display pull-quote that rises line by line; the rest reads
          in the wide cell of a ruled 5/7 split, foot-aligned with the photograph. */}
      <section aria-label={about.heading} className={cn(WRAP, 'pb-24 md:pb-36')}>
        {/* data-enter: on a desktop the quote shares the first screen with the masthead
            (see index.css); it still plays on view, so a phone sees it too. */}
        <div data-enter="" className="pb-16 pt-5 md:pb-28">
          <SectionMarker number="01">Profile</SectionMarker>
          <SplitReveal
            as="p"
            by="line"
            text={lead}
            delay={0.35}
            // A paragraph, not a headline: display-md at the top of its range, but one
            // clamp that starts lower (28px) so a phone is not handed a screenful of it,
            // and a little more air between the lines.
            className="display-md mt-12 text-[length:clamp(1.75rem,4.5vw,4rem)] leading-[1.08] text-foreground md:mt-20 lg:max-w-[94%]"
          />
        </div>

        <div className="relative grid border-y border-border lg:grid-cols-12">
          <span aria-hidden="true" className="absolute inset-y-0 left-[41.666667%] hidden w-px bg-border lg:block" />

          {story && (
            <figure className="lg:col-span-5">
              {/* Flush: no gutter between the photograph and the rules around it. */}
              <ImageReveal className="aspect-[4/3] bg-secondary lg:aspect-[4/5]">
                <Parallax speed={0.08} className="h-full w-full">
                  <LazyImage
                    image={story.cover.image}
                    alt={story.cover.alt}
                    sizes="(min-width: 1280px) 514px, (min-width: 1024px) 42vw, calc(100vw - 32px)"
                    className={DRIFTING_PHOTO}
                    style={{ objectPosition: story.cover.position }}
                  />
                </Parallax>
              </ImageReveal>
              <figcaption className="flex min-h-14 flex-wrap items-center justify-between gap-x-6 border-t border-border py-1.5 lg:pr-8">
                <span className="index-num uppercase leading-normal">
                  {pad(story.number)} · {story.stage.label}
                </span>
                <Link to={`/journey/${story.stage.slug}`} data-cursor="open" className={TEXT_LINK}>
                  <span className={GROUP_UNDERLINE}>{story.stage.title}</span>
                  <ArrowTravel direction="up-right" />
                </Link>
              </figcaption>
            </figure>
          )}

          <div
            className={cn(
              'grid content-end gap-x-8 gap-y-6 border-t border-border py-12 md:grid-cols-2 lg:border-t-0 lg:py-16 lg:pl-8',
              story ? 'lg:col-span-7' : 'lg:col-span-7 lg:col-start-6'
            )}
          >
            {paragraphs.map((paragraph, i) => (
              <Reveal as="p" key={paragraph} delay={i * 0.08} className={BODY}>
                {paragraph}
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 2 — Facts, as one ruled row on ink. Label first, figure second: the labels end
          in "since", so this is the order they read in (and the order a screen reader
          gets). Inside bg-ink the hairlines take the ink rule by themselves. */}
      <section
        aria-labelledby="about-facts-heading"
        // The borders only show in dark mode, where ink and the page are a shade apart.
        className="relative isolate overflow-hidden border-y border-ink-border bg-ink text-ink-foreground"
      >
        <Grain className="-z-10" />
        <div className={cn(WRAP, 'py-24 md:py-32')}>
          <h2 id="about-facts-heading" className="sr-only">
            {site.shortName} in figures
          </h2>
          <DrawnRule />
          <div aria-hidden="true" className="pt-4 md:pt-5">
            <SectionMarker number="02" onInk>
              At a Glance
            </SectionMarker>
          </div>

          <dl
            className="mt-14 grid border-y border-border md:mt-20 lg:[grid-template-columns:var(--fact-columns)]"
            style={{ '--fact-columns': FACT_COLUMNS } as CSSProperties}
          >
            {facts.map((fact, i) => (
              <div
                key={fact.label}
                className={cn(
                  'flex min-w-0 flex-col gap-8 py-9 lg:gap-16 lg:py-10 lg:pr-8',
                  i > 0 && 'border-t border-border lg:border-l lg:border-t-0 lg:pl-8'
                )}
              >
                <Reveal as="dt" from="none" delay={i * 0.09} className="eyebrow max-w-[28ch] leading-relaxed">
                  {fact.label}
                </Reveal>
                {/* mt-auto keeps the figures on one line when a label wraps. */}
                <dd className="display-xl mt-auto text-ink-foreground">
                  <SplitReveal as="span" text={figure(fact)} delay={i * 0.09} />
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* 3 */}
      <HeritageTimeline number="03" />

      {/* 4 — The pair: a ruled 7/5 split, both photographs flush to the rules and of
          one height. Captions are the journey stages' own titles. */}
      {pair.length > 0 && (
        <section aria-labelledby="about-pair-heading" className={cn(WRAP, 'pb-24 md:pb-36')}>
          <SectionHead
            number="04"
            label={journeyIntro.eyebrow}
            title="Processing and Manufacturing"
            id="about-pair-heading"
          >
            <Link to="/journey" data-cursor="open" className={TEXT_LINK}>
              <span className={GROUP_UNDERLINE}>{journeyIntro.heading}</span>
              <ArrowTravel />
            </Link>
          </SectionHead>

          <div className="relative mt-14 grid border-y border-border md:mt-20 lg:grid-cols-12">
            <span
              aria-hidden="true"
              className="absolute inset-y-0 left-[58.333333%] z-10 hidden w-px bg-border lg:block"
            />
            {pair.map(({ stage, cover, number }, i) => {
              const shape = PAIR_SHAPES[i % PAIR_SHAPES.length];
              return (
                <Link
                  key={stage.slug}
                  to={`/journey/${stage.slug}`}
                  data-cursor="view"
                  className={cn(
                    'group relative flex flex-col focus-visible:z-20',
                    shape.cell,
                    i > 0 && 'border-t border-border lg:border-t-0'
                  )}
                >
                  <ImageReveal direction={i % 2 === 0 ? 'right' : 'up'} delay={i * 0.12} className={cn('bg-secondary', shape.ratio)}>
                    <Parallax speed={i % 2 === 0 ? 0.06 : 0.1} className="h-full w-full">
                      <LazyImage
                        image={cover.image}
                        alt={cover.alt}
                        sizes={shape.sizes}
                        className={DRIFTING_PHOTO}
                        style={{ objectPosition: cover.position }}
                      />
                    </Parallax>
                    <span aria-hidden="true" className={PHOTO_HOVER} />
                  </ImageReveal>
                  <Reveal
                    delay={0.1 + i * 0.12}
                    className={cn(
                      'flex flex-1 items-end justify-between gap-6 border-t border-border pb-8 pt-6 md:pb-10',
                      i % 2 === 0 ? 'lg:pr-8' : 'lg:pl-8'
                    )}
                  >
                    <div>
                      <p className="index-num uppercase leading-normal">
                        {pad(number)} · {stage.label}
                      </p>
                      <h3 className="display-sm mt-4 text-foreground">
                        <span className={GROUP_UNDERLINE}>{stage.title}</span>
                      </h3>
                    </div>
                    <ArrowTravel
                      direction="up-right"
                      className="mb-2 h-5 w-5 text-foreground transition-colors group-hover:text-accent group-focus-visible:text-accent"
                    />
                  </Reveal>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* 5 */}
      <ExportRange number="05" />
    </PageLayout>
  );
};

export default AboutUs;
