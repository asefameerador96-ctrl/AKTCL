import { useRef, useState } from 'react';
import type { CigaretteSize } from '@/content/sizes';
import { cn } from '@/lib/utils';
import { isStill, revealTransition, useInView, useReveal } from '@/lib/motion';
import { BAND_MM, FILTER_SHARE, GIRTH_MM, LINEUP_SPAN_MM, rodExtentMm, toPercent } from './geometry';

export type RodSize = Pick<CigaretteSize, 'name' | 'lengthLabel' | 'rod'>;

interface RodDiagramProps {
  size: RodSize;
  /**
   * The mm the drawing's full width stands for. Keep the default wherever diagrams are
   * compared (the line-up, page to page): one span means one mm-to-px scale.
   */
  spanMm?: number;
  /** Draw the dimension line with its ticks and the length label under the rod. */
  dimension?: boolean;
  /** Seconds before the drawing starts to wipe in. */
  delay?: number;
  /** Hide it from assistive tech where the text around it already says the same. */
  decorative?: boolean;
  className?: string;
}

/** mm of air above and below the thickest rod. */
const PAD = 1;
/** Rod band to dimension line, mm. */
const DIM_GAP = 4.5;
/** Half the length of a dimension tick (a 45° slash), mm. */
const TICK = 0.9;
/** Distance between the filter's hatch lines, mm. */
const HATCH_STEP = 1.8;

/** Every stroke is a 1px hairline whatever the drawing's scale. */
const LINE = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1,
  vectorEffect: 'non-scaling-stroke',
} as const;

// The wipe runs past the box so nothing drawn over its edges — the hairline on the
// datum, the dimension ticks, the centre line's overrun — is ever shaved at rest.
const WIPE_SHOWN = 'inset(-16px -40px -16px -16px)';
const WIPE_HIDDEN = 'inset(-16px calc(100% + 40px) -16px -16px)';

const r = (n: number) => +n.toFixed(3);

/** 45° hatch lines clipped to the filter rectangle, computed rather than masked (no ids). */
function hatchPath(filterMm: number, top: number, girth: number) {
  let d = '';
  for (let x0 = -girth; x0 < filterMm; x0 += HATCH_STEP) {
    const t0 = Math.max(0, -x0);
    const t1 = Math.min(girth, filterMm - x0);
    if (t1 <= t0) continue;
    d += `M${r(x0 + t0)} ${r(top + girth - t0)}L${r(x0 + t1)} ${r(top + girth - t1)}`;
  }
  return d;
}

const tick = (x: number, y: number) => `M${r(x - TICK)} ${r(y + TICK)}L${r(x + TICK)} ${r(y - TICK)}`;

/**
 * A cigarette format as a technical drawing, in hairlines of the text colour: the rod
 * outlined from a common datum on the left, the filter segment tinted and hatched, and
 * where the format is defined as a range (Slim, Nano) the longer rod continued in a
 * dashed phantom line. With `dimension`, a dimension line with slashed ticks and the
 * length label in mono beneath it.
 *
 * Drawn in mm on one shared span (geometry.ts), so any two diagrams set at the same
 * width compare truthfully. The drawn diameters are proportions only and are never
 * shown as numbers. It wipes in from the datum each time it comes on screen and back
 * as it leaves; under isStill() (prerender, reduced motion) it is simply drawn.
 */
const RodDiagram = ({
  size,
  spanMm = LINEUP_SPAN_MM,
  dimension = false,
  delay = 0,
  decorative = false,
  className,
}: RodDiagramProps) => {
  const [still] = useState(isStill);
  const ref = useRef<HTMLDivElement>(null);
  const shown = useReveal(useInView(ref, { skip: still }));

  const { rod } = size;
  const length = rod.lengthMm;
  const extent = rodExtentMm(rod);
  const range = extent > length;
  const girth = GIRTH_MM[rod.relativeGirth];
  const filter = length * FILTER_SHARE;

  // The rod sits centred in the band the thickest format needs, so rows line up.
  const top = PAD + (BAND_MM - girth) / 2;
  const bottom = top + girth;
  const axis = PAD + BAND_MM / 2;
  const dimY = PAD + BAND_MM + DIM_GAP;
  const height = dimension ? dimY + TICK + 0.6 : PAD * 2 + BAND_MM;

  const outline = `M0 ${r(top)}H${r(length)}V${r(bottom)}H0Z`;
  const phantom = `M${r(length)} ${r(top)}H${r(extent)}V${r(bottom)}H${r(length)}`;
  const extension = (x: number) => `M${r(x)} ${r(bottom + 0.8)}V${r(dimY + 1.4)}`;

  const label = `${size.name} format, ${size.lengthLabel} rod length`;

  return (
    <div
      ref={ref}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative ? true : undefined}
      className={cn('text-foreground', className)}
    >
      <div
        style={
          still
            ? undefined
            : {
                clipPath: shown ? WIPE_SHOWN : WIPE_HIDDEN,
                transition: revealTransition(shown, 'clip-path', 1.2, delay),
              }
        }
      >
        <svg
          viewBox={`0 0 ${spanMm} ${r(height)}`}
          preserveAspectRatio="xMinYMin meet"
          className="block h-auto w-full overflow-visible"
          style={{ aspectRatio: `${spanMm} / ${r(height)}` }}
          aria-hidden="true"
          focusable="false"
        >
          {/* The rod's body on the surface tone, so it reads as a solid against the page. */}
          <rect x={0} y={r(top)} width={r(length)} height={r(girth)} className="fill-card" />
          {/* Filter: a light tint of the text colour with a 45° hatch, then the tipping line. */}
          <rect x={0} y={r(top)} width={r(filter)} height={r(girth)} fill="currentColor" fillOpacity={0.08} />
          <path d={hatchPath(filter, top, girth)} {...LINE} strokeOpacity={0.3} />

          {dimension && (
            // Centre line, dash-dot, running a little past the rod's end.
            <path d={`M0 ${r(axis)}H${r(extent + 3)}`} {...LINE} strokeOpacity={0.3} strokeDasharray="14 4 2 4" />
          )}

          <path d={outline} {...LINE} />
          <path d={`M${r(filter)} ${r(top)}V${r(bottom)}`} {...LINE} />
          {range && <path d={phantom} {...LINE} strokeDasharray="5 4" />}

          {dimension && (
            <g>
              <path d={extension(0) + extension(length) + (range ? extension(extent) : '')} {...LINE} strokeOpacity={0.45} />
              <path d={`M0 ${r(dimY)}H${r(length)}`} {...LINE} />
              {range && <path d={`M${r(length)} ${r(dimY)}H${r(extent)}`} {...LINE} strokeDasharray="5 4" />}
              <path d={tick(0, dimY) + tick(length, dimY) + (range ? tick(extent, dimY) : '')} {...LINE} />
            </g>
          )}
        </svg>
      </div>

      {dimension && (
        // HTML, not SVG text: the label keeps the mono's 13px at every drawing scale.
        <div className="relative mt-3 h-4">
          <span
            className="index-num absolute top-0 -translate-x-1/2 whitespace-nowrap text-foreground"
            style={{
              left: toPercent(extent / 2, spanMm),
              ...(still
                ? undefined
                : { opacity: shown ? 1 : 0, transition: revealTransition(shown, 'opacity', 0.9, delay + 0.45) }),
            }}
          >
            {size.lengthLabel}
          </span>
        </div>
      )}
    </div>
  );
};

export default RodDiagram;
