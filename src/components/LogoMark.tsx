import { cn } from '@/lib/utils';

/**
 * The AKT monogram — the organisation's official mark.
 *
 * The three paths are the original vector artwork, lifted unchanged from the
 * Illustrator smart object inside the supplied "AKT_LOGO ONLY.psd" (never redrawn or
 * traced). The file is single-colour, so the mark is painted in currentColor and
 * takes its tone from the surface it sits on. scripts/make-brand-assets.mjs holds
 * the same paths for the favicon, app icons and share image — keep the two in step.
 *
 * The viewBox is a hair larger than the artboard: two of the curves overshoot it
 * by a few hundredths of a unit and would otherwise be shaved flat.
 */
export const LOGO_MARK_VIEWBOX = '-0.08 -0.01 16.84 10.16';
export const LOGO_MARK_RATIO = 16.84 / 10.16;

interface LogoMarkProps {
  className?: string;
  /** Accessible name. Omit when the mark is decorative or sits beside the company name. */
  title?: string;
}

const LogoMark = ({ className, title }: LogoMarkProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox={LOGO_MARK_VIEWBOX}
    fill="currentColor"
    role={title ? 'img' : undefined}
    aria-label={title}
    aria-hidden={title ? undefined : true}
    focusable="false"
    className={cn('block h-auto', className)}
  >
    <path
      transform="matrix(1,0,0,-1,6.2193,9.9581)"
      d="M0 0H1.258V9.853C1.258 9.853 1.013 9.853 .769 9.504 .524 9.154-5.591 1.922-5.87 1.502-6.15 1.083-6.289 .629-6.185 .419-6.08 .21-5.591 0-4.997 0H-1.712C-1.083 0-.874 .594-.874 1.083-.874 1.572-1.188 1.992-1.852 1.992-2.516 1.992-3.04 2.516-3.145 2.83-3.249 3.145-3.005 3.634-2.865 3.809-2.725 3.983-1.363 5.73-1.363 5.73H-.14Z"
    />
    <path
      transform="matrix(1,0,0,-1,12.5786,0)"
      d="M0 0H-1.013C-1.013 0-4.368-4.368-4.542-4.612-4.717-4.857-4.962-5.206-4.647-5.87-4.333-6.534-2.97-9.434-2.795-9.748-2.621-10.063-1.957-10.133-1.677-9.993-1.398-9.853-.874-9.609-.804-9.364-.734-9.12-.629-9.12-1.293-7.757-1.957-6.394-2.481-5.171-2.481-4.717-2.481-4.263-1.957-3.354-1.677-2.9-1.398-2.446 0 0 0 0"
    />
    <path
      transform="matrix(1,0,0,-1,16.7452,1.8867998)"
      d="M0 0H-4.647V-1.363H-3.057V-7.862H-1.59V-1.363H0Z"
    />
  </svg>
);

export default LogoMark;
