import { Link } from 'react-router-dom';
import PageLayout from '@/components/PageLayout';
import PageHeader, {
  ArrowTravel,
  DISPLAY_H2,
  DrawnRule,
  GROUP_UNDERLINE,
  LABEL,
  TEXT_LINK,
} from '@/components/PageHeader';
import LazyImage from '@/components/LazyImage';
import Reveal from '@/components/Reveal';
import HeritageTimeline from '@/components/HeritageTimeline';
import ExportRange from '@/components/ExportRange';
import Grain from '@/components/motion/Grain';
import ImageReveal from '@/components/motion/ImageReveal';
import Parallax from '@/components/motion/Parallax';
import SplitReveal from '@/components/motion/SplitReveal';
import { site } from '@/content/site';
import { about, facts, type Fact } from '@/content/about';
import { journey, journeyBySlug, journeyIntro } from '@/content/journey';
import { journeyImages } from '@/content/images';
import { ROUTE_BY_PATH } from '@/seo/routeMeta';
import { cn } from '@/lib/utils';

const route = ROUTE_BY_PATH['/about-us'];

// Same gutters as the navbar and footer, so page content lines up with the chrome.
const WRAP = 'mx-auto max-w-7xl px-4 sm:px-6';

/** The tall photo beside the copy, and the two stages shown in the image pair. */
const STORY_STAGE = 'harvest';
const PAIR_STAGES = ['process', 'manufacture'];

/** Pairs a journey stage with its cover photo; drops the slug if either is missing. */
const stageWithCover = (slug: string) => {
  const stage = journeyBySlug(slug);
  const cover = journeyImages[slug]?.[0];
  return stage && cover ? [{ stage, cover, number: journey.indexOf(stage) + 1 }] : [];
};

// Final values, no count-up: the homepage animates these figures, here they are read.
const formatFact = (fact: Fact) =>
  `${fact.isYear ? fact.value : fact.value.toLocaleString('en-US')}${fact.suffix ?? ''}`;

// A photograph inside a Parallax needs bleed to cover its travel: scale-110, and a
// little more while its link is hovered.
const DRIFTING_PHOTO =
  'absolute inset-0 h-full w-full scale-110 object-cover transition-transform duration-1000 ease-expo-out motion-safe:group-hover:scale-[1.14]';

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
      {/* The bottom padding belongs to the pull-quote below. */}
      <PageHeader
        breadcrumbs={route.breadcrumbs}
        eyebrow={about.heading}
        title={site.name}
        className="pb-0 md:pb-0"
      />

      {/* 1 — The About copy, verbatim. Its first paragraph is set as a display
          pull-quote that rises line by line; the rest reads in the right-hand column,
          foot-aligned with the photograph. */}
      <section aria-label={about.heading} className={cn(WRAP, 'pb-24 pt-10 md:pb-36 md:pt-14')}>
        {/* data-enter: on a desktop the quote shares the first screen with the masthead
            (see index.css); it still plays on view, so a phone sees it too. */}
        <div data-enter="">
          <SplitReveal
            as="p"
            by="line"
            text={lead}
            delay={0.35}
            className="font-display text-[length:clamp(1.625rem,3.3vw,3rem)] font-normal leading-[1.18] tracking-[-0.02em] text-foreground lg:max-w-[92%]"
          />
        </div>

        <div className="mt-16 grid gap-x-16 gap-y-12 md:mt-24 lg:grid-cols-12">
          {story && (
            <figure className="lg:col-span-5">
              <ImageReveal className="aspect-[4/3] rounded-lg bg-secondary lg:aspect-[4/5]">
                <Parallax speed={0.08} className="h-full w-full">
                  <LazyImage
                    image={story.cover.image}
                    alt={story.cover.alt}
                    sizes="(min-width: 1280px) 540px, (min-width: 1024px) 44vw, calc(100vw - 32px)"
                    className="absolute inset-0 h-full w-full scale-110 object-cover"
                    style={{ objectPosition: story.cover.position }}
                  />
                </Parallax>
              </ImageReveal>
              <figcaption className="mt-3 flex flex-wrap items-center gap-x-5">
                <span className={LABEL}>
                  {String(story.number).padStart(2, '0')} · {story.stage.label}
                </span>
                <Link
                  to={`/journey/${story.stage.slug}`}
                  className="group inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground transition-colors duration-500 ease-expo-out hover:text-foreground"
                >
                  <span className={GROUP_UNDERLINE}>{story.stage.title}</span>
                  <ArrowTravel direction="up-right" />
                </Link>
              </figcaption>
            </figure>
          )}

          <div className="space-y-6 text-base/[1.75] text-muted-foreground md:text-lg/[1.75] lg:col-span-6 lg:col-start-7 lg:self-end lg:pb-14">
            {paragraphs.map((paragraph, i) => (
              <Reveal as="p" key={paragraph} delay={i * 0.08} className="max-w-[64ch]">
                {paragraph}
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 2 — Facts strip. Label first, figure second: the labels end in "since", so
          this is the order they read in (and the order a screen reader gets). */}
      <section
        aria-labelledby="about-facts-heading"
        // The borders only show in dark mode, where ink and the page are a shade apart.
        className="relative isolate overflow-hidden border-y border-ink-border bg-ink text-ink-foreground"
      >
        <Grain className="-z-10" />
        <div className={cn(WRAP, 'py-16 md:py-24')}>
          <h2 id="about-facts-heading" className="sr-only">
            {site.shortName} in figures
          </h2>
          {/* A ruled list up to lg — "50,000+" at this size does not fit a third of a
              tablet — then three columns. */}
          <dl className="grid divide-y divide-ink-border lg:grid-cols-3 lg:divide-x lg:divide-y-0">
            {facts.map((fact, i) => (
              <div
                key={fact.label}
                className="flex min-w-0 flex-col gap-6 py-9 first:pt-0 last:pb-0 sm:flex-row sm:items-end sm:justify-between lg:flex-col lg:items-start lg:justify-start lg:gap-10 lg:px-10 lg:py-2 lg:first:pl-0 lg:last:pr-0"
              >
                <Reveal as="dt" from="none" delay={i * 0.09} className={cn(LABEL, 'max-w-[26ch] leading-relaxed text-ink-muted')}>
                  {fact.label}
                </Reveal>
                {/* mt-auto keeps the figures on one line when a label wraps. */}
                <dd className="font-display text-[length:clamp(3.75rem,7vw,6.5rem)] font-normal leading-[0.85] tracking-[-0.035em] text-gold lg:mt-auto">
                  <SplitReveal as="span" text={formatFact(fact)} delay={i * 0.09} />
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* 3 */}
      <HeritageTimeline />

      {/* 4 — An uneven pair: the wide photograph sets the line, the tall one hangs
          below it. Captions are the journey stages' own titles. */}
      {pair.length > 0 && (
        <section aria-labelledby="about-pair-heading" className="overflow-x-clip pb-24 md:pb-36">
          <div className={WRAP}>
            <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
              <div>
                <Reveal as="p" from="none" className="eyebrow">
                  {journeyIntro.eyebrow}
                </Reveal>
                <SplitReveal
                  as="h2"
                  id="about-pair-heading"
                  text="Processing and Manufacturing"
                  className={cn('mt-4 max-w-[14ch]', DISPLAY_H2)}
                />
              </div>
              <Link to="/journey" data-cursor="open" className={TEXT_LINK}>
                <span className={GROUP_UNDERLINE}>{journeyIntro.heading}</span>
                <ArrowTravel />
              </Link>
            </div>
            <DrawnRule className="mt-8 md:mt-12" delay={0.15} />

            <div className="mt-10 grid gap-x-8 gap-y-14 md:mt-16 md:grid-cols-12 lg:gap-x-16">
              {pair.map(({ stage, cover, number }, i) => (
                <Link
                  key={stage.slug}
                  to={`/journey/${stage.slug}`}
                  data-cursor="view"
                  className={cn(
                    'group block rounded-lg',
                    i % 2 === 0 ? 'md:col-span-7' : 'md:col-span-5 md:mt-32 lg:mt-48'
                  )}
                >
                  <ImageReveal
                    direction={i % 2 === 0 ? 'right' : 'up'}
                    delay={i * 0.12}
                    className={cn('rounded-lg bg-secondary', i % 2 === 0 ? 'aspect-[4/3]' : 'aspect-[4/3] md:aspect-[4/5]')}
                  >
                    <Parallax speed={i % 2 === 0 ? 0.06 : 0.1} className="h-full w-full">
                      <LazyImage
                        image={cover.image}
                        alt={cover.alt}
                        sizes={
                          i % 2 === 0
                            ? '(min-width: 1280px) 760px, (min-width: 768px) 64vw, calc(100vw - 32px)'
                            : '(min-width: 1280px) 720px, (min-width: 768px) 60vw, calc(100vw - 32px)'
                        }
                        className={DRIFTING_PHOTO}
                        style={{ objectPosition: cover.position }}
                      />
                    </Parallax>
                  </ImageReveal>
                  <Reveal delay={0.1 + i * 0.12} className="mt-5 flex items-start justify-between gap-6">
                    <div>
                      <p className={LABEL}>
                        {String(number).padStart(2, '0')} · {stage.label}
                      </p>
                      <h3 className="mt-3 font-display text-2xl/[1.1] font-normal tracking-[-0.02em] text-foreground md:text-3xl/[1.1]">
                        <span className={GROUP_UNDERLINE}>{stage.title}</span>
                      </h3>
                    </div>
                    <ArrowTravel direction="up-right" className="mt-1 h-5 w-5 text-accent" />
                  </Reveal>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5 */}
      <ExportRange />
    </PageLayout>
  );
};

export default AboutUs;
