import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import PageLayout from '@/components/PageLayout';
import Breadcrumbs from '@/components/Breadcrumbs';
import LazyImage from '@/components/LazyImage';
import Reveal from '@/components/Reveal';
import HeritageTimeline from '@/components/HeritageTimeline';
import ExportRange from '@/components/ExportRange';
import { site } from '@/content/site';
import { about, facts, type Fact } from '@/content/about';
import { journey, journeyBySlug, journeyIntro } from '@/content/journey';
import { journeyImages } from '@/content/images';
import { ROUTE_BY_PATH } from '@/seo/routeMeta';

const route = ROUTE_BY_PATH['/about-us'];

/** The tall photo beside the copy, and the two stages shown in the image band. */
const STORY_STAGE = 'harvest';
const BAND_STAGES = ['process', 'manufacture'];

/** Pairs a journey stage with its cover photo; drops the slug if either is missing. */
const stageWithCover = (slug: string) => {
  const stage = journeyBySlug(slug);
  const cover = journeyImages[slug]?.[0];
  return stage && cover ? [{ stage, cover, number: journey.indexOf(stage) + 1 }] : [];
};

// Final values, no count-up: the homepage animates these figures, here they are read.
const formatFact = (fact: Fact) =>
  `${fact.isYear ? fact.value : fact.value.toLocaleString('en-US')}${fact.suffix ?? ''}`;

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
  const band = BAND_STAGES.flatMap(stageWithCover);

  return (
    <PageLayout>
      {/* Same markup as <PageHeader>; the bottom padding belongs to the copy below. */}
      <header className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 md:pt-14">
        <Breadcrumbs items={route.breadcrumbs} />
        <Reveal className="mt-8 max-w-4xl md:mt-12">
          <p className="eyebrow">{about.heading}</p>
          <h1 className="mt-4 text-4xl/[1.08] font-medium tracking-tight sm:text-5xl/[1.08] lg:text-6xl/[1.08]">
            {site.name}
          </h1>
          <div className="rule mt-8" aria-hidden="true" />
        </Reveal>
      </header>

      {/* 1 — The About copy, verbatim. Mobile order is lead, photo, rest; from lg the
          photo takes the right-hand column and holds while the text scrolls past.
          The 1fr second row soaks up any spare height, so the lead and the rest never
          drift apart when the photo is the taller column. */}
      <section
        aria-label={about.heading}
        className="mx-auto max-w-7xl px-4 pb-20 pt-12 sm:px-6 md:pb-28 md:pt-16"
      >
        <div className="grid gap-y-10 lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:gap-x-16">
          <Reveal
            as="p"
            className="font-display text-xl/snug text-foreground sm:text-2xl/snug md:text-3xl/snug lg:col-span-7"
          >
            {lead}
          </Reveal>

          {story && (
            <Reveal
              as="figure"
              delay={0.15}
              className="lg:sticky lg:top-28 lg:col-span-5 lg:col-start-8 lg:row-span-2 lg:row-start-1 lg:self-start"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-secondary lg:aspect-[4/5]">
                <LazyImage
                  image={story.cover.image}
                  alt={story.cover.alt}
                  sizes="(min-width: 1280px) 480px, (min-width: 1024px) 38vw, calc(100vw - 32px)"
                  className="absolute inset-0 h-full w-full object-cover"
                  style={{ objectPosition: story.cover.position }}
                  priority
                />
              </div>
              <figcaption className="mt-2 flex flex-wrap items-center gap-x-4">
                <span className="eyebrow">{story.stage.label}</span>
                <Link
                  to={`/journey/${story.stage.slug}`}
                  className="inline-flex min-h-11 items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-accent"
                >
                  {story.stage.title}
                  <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                </Link>
              </figcaption>
            </Reveal>
          )}

          <div className="space-y-6 text-base/relaxed text-muted-foreground md:text-lg/relaxed lg:col-span-7">
            {paragraphs.map((paragraph) => (
              <Reveal as="p" key={paragraph}>
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
        className="border-y border-ink-border bg-ink text-ink-foreground"
      >
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-20">
          <h2 id="about-facts-heading" className="sr-only">
            {site.shortName} in figures
          </h2>
          <dl className="grid divide-y divide-ink-border md:grid-cols-3 md:divide-x md:divide-y-0">
            {facts.map((fact, i) => (
              <Reveal
                key={fact.label}
                delay={i * 0.1}
                className="flex min-w-0 flex-col gap-5 py-8 first:pt-0 last:pb-0 md:px-6 md:py-2 md:first:pl-0 md:last:pr-0 lg:px-10"
              >
                <dt className="text-xs font-medium uppercase leading-relaxed tracking-[0.2em] text-ink-muted">
                  {fact.label}
                </dt>
                {/* mt-auto keeps the figures on one line when a label wraps. The size
                    steps down at md: "50,000+" has to fit a third of a 768px row. */}
                <dd className="mt-auto font-display text-5xl leading-none text-gold md:text-4xl lg:text-5xl xl:text-6xl">
                  {formatFact(fact)}
                </dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      {/* 3 */}
      <HeritageTimeline />

      {/* 4 — Two-up, full-bleed. Captions are the journey stages' own titles. */}
      {band.length > 0 && (
        <section aria-labelledby="about-band-heading">
          <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-x-10 gap-y-4 px-4 pb-10 sm:px-6 md:pb-14">
            <Reveal>
              <p className="eyebrow">{journeyIntro.eyebrow}</p>
              <h2
                id="about-band-heading"
                className="mt-4 text-3xl/tight font-medium md:text-4xl/tight lg:text-5xl/tight"
              >
                Processing and Manufacturing
              </h2>
              <div className="rule mt-6" aria-hidden="true" />
            </Reveal>
            <Link
              to="/journey"
              className="inline-flex min-h-11 items-center gap-2 text-sm font-medium uppercase tracking-[0.15em] text-accent transition-colors hover:text-foreground"
            >
              {journeyIntro.heading}
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>

          {/* The caption sits on a solid ink bar, not over the photo: these are bright
              factory interiors, and small gold type on a scrim does not hold AA there. */}
          <div className="grid bg-ink md:grid-cols-2 md:divide-x md:divide-ink-border">
            {band.map(({ stage, cover, number }, i) => (
              <Reveal key={stage.slug} delay={i * 0.12}>
                {/* The default focus ring would be clipped at the viewport edge, so
                    these tiles draw a two-tone frame inside themselves instead. */}
                <Link
                  to={`/journey/${stage.slug}`}
                  className="group relative flex h-full flex-col focus-visible:ring-0 focus-visible:ring-offset-0"
                >
                  <div className="relative aspect-[4/3] overflow-hidden lg:aspect-[3/2]">
                    <LazyImage
                      image={cover.image}
                      alt={cover.alt}
                      sizes="(min-width: 768px) 50vw, 100vw"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out motion-safe:group-hover:scale-[1.03]"
                      style={{ objectPosition: cover.position }}
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-between gap-5 px-4 py-7 sm:px-6 md:px-10 md:py-9 lg:flex-row lg:items-end">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.3em] text-gold">
                        {String(number).padStart(2, '0')} · {stage.label}
                      </p>
                      <h3 className="mt-3 text-2xl/snug font-medium text-ink-foreground md:text-3xl/snug">
                        {stage.title}
                      </h3>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-ink-muted transition-colors group-hover:text-gold">
                      View stage
                      <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                    </span>
                  </div>
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-3 rounded-sm opacity-0 ring-2 ring-gold ring-offset-2 ring-offset-ink group-focus-visible:opacity-100"
                  />
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* 5 */}
      <ExportRange />
    </PageLayout>
  );
};

export default AboutUs;
