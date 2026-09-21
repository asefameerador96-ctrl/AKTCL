import PageLayout from '@/components/PageLayout';
import PageHeader, { SectionHead, WRAP } from '@/components/PageHeader';
import Reveal from '@/components/Reveal';
import RodLineUp from '@/components/sizes/RodLineUp';
import SizeRow from '@/components/sizes/SizeRow';
import { cigaretteSizes, sizesIntro } from '@/content/sizes';
import { ROUTE_BY_PATH } from '@/seo/routeMeta';
import { cn } from '@/lib/utils';

const PATH = '/cigarette-sizes';

/**
 * /cigarette-sizes — the formats. The masthead, then the segment's signature drawing:
 * every format's rod on one scale, hung from the masthead's closing rule, with the
 * reference guides at the fixed lengths. Then the formats again as directory rows,
 * each to its size page. PageLayout closes with the enquiry band.
 */
const SizesIndex = () => (
  <PageLayout enquiryProduct="Finished cigarettes">
    <PageHeader
      breadcrumbs={ROUTE_BY_PATH[PATH]?.breadcrumbs ?? [{ name: sizesIntro.eyebrow, path: PATH }]}
      eyebrow={sizesIntro.eyebrow}
      title={sizesIntro.heading}
      lead={sizesIntro.lead}
    />

    {/* First screen on a desktop: data-enter="view" keeps the prerendered drawing
        unpainted until the app can bring it in, and its rows still replay on scroll. */}
    <section aria-labelledby="lineup-heading" data-enter="view" className={WRAP}>
      <h2 id="lineup-heading" className="eyebrow pb-8 pt-6 md:pb-12 lg:pt-10">
        Drawn to scale
      </h2>
      <RodLineUp />
    </section>

    <section aria-labelledby="formats-heading" className={cn(WRAP, 'pb-24 pt-24 md:pb-36 md:pt-36')}>
      <SectionHead label="Formats" title="Specifications by format" id="formats-heading" />
      {/* Each row draws its own top hairline; the list closes the last one. */}
      <ul role="list" className="mt-14 border-b border-border md:mt-20">
        {cigaretteSizes.map((size, i) => (
          <Reveal as="li" key={size.slug} delay={Math.min(i, 3) * 0.07}>
            <SizeRow size={size} />
          </Reveal>
        ))}
      </ul>
    </section>
  </PageLayout>
);

export default SizesIndex;
