import { cn } from '@/lib/utils';

export interface GrainProps {
  className?: string;
  /** 0–1. Around 0.12 is felt rather than seen. */
  opacity?: number;
}

// feTurbulence noise flattened to white-with-varying-alpha by the colour matrix, so
// the layer lightens whatever band it lies on and no colour literal is involved.
// A data: URI keeps it inside the CSP (img-src 'self' data:) and costs no request.
const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E" +
  "%3Cfilter id='n' x='0' y='0' width='100%25' height='100%25'%3E" +
  "%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E" +
  "%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .55 0'/%3E%3C/filter%3E" +
  "%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

/**
 * Film grain for the ink bands: takes the flatness out of a large dark field the way
 * paper stock does. Absolutely positioned — the parent needs `relative` (and usually
 * `isolate`, with its content above). Static on purpose: still grain is free, moving
 * grain repaints a full-width layer every frame.
 */
const Grain = ({ className, opacity = 0.12 }: GrainProps) => (
  <div
    aria-hidden="true"
    className={cn('pointer-events-none absolute inset-0', className)}
    style={{ backgroundImage: NOISE, backgroundSize: '220px 220px', opacity }}
  />
);

export default Grain;
