import { Link } from 'react-router-dom';
import { ArrowTravel, ROW_LINE, ROW_SHIFT } from '@/components/PageHeader';
import type { CigaretteSize } from '@/content/sizes';
import { cn } from '@/lib/utils';

interface SizeRowProps {
  size: CigaretteSize;
}

/**
 * One format as a directory row of /cigarette-sizes: the name in the display serif,
 * its length label in mono, the AKTCL lines made in it as a quiet mono list (when
 * there are any), and a travelling arrow. The whole row is the link; the house hover
 * — the accent drawn over the row's hairline, the name 8px along, the arrow through.
 * The row draws its own top rule; close a list of them with one border-b.
 */
const SizeRow = ({ size }: SizeRowProps) => (
  <Link
    to={`/cigarette-sizes/${size.slug}`}
    data-cursor="open"
    className="group relative grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-6 gap-y-3 border-t border-border py-8 md:py-10 lg:grid-cols-12 lg:gap-x-0"
  >
    <span aria-hidden="true" className={ROW_LINE} />
    <span className={cn('display-sm text-foreground lg:col-span-4 lg:pr-8', ROW_SHIFT)}>{size.name}</span>
    <ArrowTravel className="col-start-2 row-start-1 self-center justify-self-end text-foreground transition-colors group-hover:text-accent group-focus-visible:text-accent lg:col-start-12" />
    <span className="index-num col-span-2 text-foreground lg:col-span-2 lg:col-start-5 lg:row-start-1">
      {size.lengthLabel}
    </span>
    {size.aktclLines.length > 0 && (
      <span className="mono-label col-span-2 text-muted-foreground lg:col-span-5 lg:col-start-7 lg:row-start-1 lg:pr-8">
        <span className="sr-only">AKTCL lines in this format: </span>
        {size.aktclLines.map((line, i) => (
          <span key={line}>
            {i > 0 && (
              <span aria-hidden="true" className="px-2 opacity-60">
                /
              </span>
            )}
            {i > 0 && <span className="sr-only">, </span>}
            {line}
          </span>
        ))}
      </span>
    )}
  </Link>
);

export default SizeRow;
