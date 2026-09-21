import { useParams } from 'react-router-dom';
import DetailPage from '@/components/DetailPage';
import NotFound from '@/pages/NotFound';
import { journey, journeyBySlug } from '@/content/journey';
import { journeyImages } from '@/content/images';
import { ROUTE_BY_PATH } from '@/seo/routeMeta';

const pad = (n: number) => String(n).padStart(2, '0');

/** /journey/:slug — one stage of the value chain, with copy verbatim from the workbook. */
const JourneyStage = () => {
  const { slug } = useParams<{ slug: string }>();
  const stage = journeyBySlug(slug?.toLowerCase());
  if (!stage) return <NotFound />;

  const index = journey.indexOf(stage);
  const path = `/journey/${stage.slug}`;
  const before = journey[index - 1];
  const after = journey[index + 1];

  return (
    <DetailPage
      breadcrumbs={
        ROUTE_BY_PATH[path]?.breadcrumbs ?? [
          { name: 'Our Journey', path: '/journey' },
          { name: stage.label, path },
        ]
      }
      eyebrow={stage.label}
      counter={`${pad(index + 1)} / ${pad(journey.length)}`}
      title={stage.title}
      lead={stage.short}
      body={[stage.long]}
      images={journeyImages[stage.slug] ?? []}
      prev={before && { label: before.label, to: `/journey/${before.slug}` }}
      // The chain ends at the finished product, so the last stage hands over to the range.
      next={
        after
          ? { label: after.label, to: `/journey/${after.slug}` }
          : { label: 'Explore Products', to: '/products' }
      }
    />
  );
};

export default JourneyStage;
