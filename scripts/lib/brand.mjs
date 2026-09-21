/**
 * The AKT monogram for build scripts (favicons, app icons, share image).
 *
 * Same three paths as src/components/LogoMark.tsx — original vector artwork from the
 * Illustrator smart object inside the supplied "AKT_LOGO ONLY.psd". Keep the two in
 * step; src/components/LogoMark.test.ts fails if they drift apart.
 */
export const MARK_VIEWBOX = { x: -0.08, y: -0.01, w: 16.84, h: 10.16 };

export const MARK_PATHS = [
  {
    transform: "matrix(1,0,0,-1,6.2193,9.9581)",
    d: "M0 0H1.258V9.853C1.258 9.853 1.013 9.853 .769 9.504 .524 9.154-5.591 1.922-5.87 1.502-6.15 1.083-6.289 .629-6.185 .419-6.08 .21-5.591 0-4.997 0H-1.712C-1.083 0-.874 .594-.874 1.083-.874 1.572-1.188 1.992-1.852 1.992-2.516 1.992-3.04 2.516-3.145 2.83-3.249 3.145-3.005 3.634-2.865 3.809-2.725 3.983-1.363 5.73-1.363 5.73H-.14Z",
  },
  {
    transform: "matrix(1,0,0,-1,12.5786,0)",
    d: "M0 0H-1.013C-1.013 0-4.368-4.368-4.542-4.612-4.717-4.857-4.962-5.206-4.647-5.87-4.333-6.534-2.97-9.434-2.795-9.748-2.621-10.063-1.957-10.133-1.677-9.993-1.398-9.853-.874-9.609-.804-9.364-.734-9.12-.629-9.12-1.293-7.757-1.957-6.394-2.481-5.171-2.481-4.717-2.481-4.263-1.957-3.354-1.677-2.9-1.398-2.446 0 0 0 0",
  },
  {
    transform: "matrix(1,0,0,-1,16.7452,1.8867998)",
    d: "M0 0H-4.647V-1.363H-3.057V-7.862H-1.59V-1.363H0Z",
  },
];

/** The grey the artwork was supplied in. */
export const MARK_SUPPLIED_COLOUR = "#727171";

// The always-dark palette of src/index.css: --ink, --ink-foreground (chalk) and --sage,
// the light tint of the racing-green accent that carries small signals on ink.
export const INK = "#10100e";
export const IVORY = "#edece8";
export const SAGE = "#a8c7b6";

/**
 * The mark as an SVG <g>, scaled to `width` and placed with its top-left at (x, y).
 * Returns the fragment and the height it occupies.
 */
export function markGroup({ x, y, width, fill }) {
  const scale = width / MARK_VIEWBOX.w;
  const height = MARK_VIEWBOX.h * scale;
  const paths = MARK_PATHS.map((p) => `<path transform="${p.transform}" d="${p.d}"/>`).join("");
  const fragment =
    `<g fill="${fill}" transform="translate(${x - MARK_VIEWBOX.x * scale} ${y - MARK_VIEWBOX.y * scale}) scale(${scale})">` +
    `${paths}</g>`;
  return { fragment, height };
}

/** A square tile with the mark centred on it. `coverage` = mark width ÷ tile width. */
export function tileSvg({ size, coverage, background, fill, radius = 0 }) {
  const width = size * coverage;
  const height = (MARK_VIEWBOX.h / MARK_VIEWBOX.w) * width;
  const { fragment } = markGroup({ x: (size - width) / 2, y: (size - height) / 2, width, fill });
  const bg = background
    ? `<rect width="${size}" height="${size}" rx="${radius}" fill="${background}"/>`
    : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${bg}${fragment}</svg>`;
}
