import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties, FocusEvent, MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from 'react';
import type { GeographiesProps } from 'react-simple-maps';
import Reveal from '@/components/Reveal';
import { SectionHead } from '@/components/Ruled';
import SplitReveal from '@/components/motion/SplitReveal';
import { EASE, isStill, observeIntersection, revealTransition, useReveal, useViewPlace } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { ORIGIN, markets, reachIntro, type Market } from '@/content/markets';

/*
 * Global Reach — Shah Agro's world map section (jute-journeys GlobalReach.tsx), ported:
 * the headline, a world map with the markets filled in, a card that follows the pointer
 * naming the country under it, and the row of country tags beneath, each of which lights
 * its country up. Recoloured to the house tokens and ruled like the rest of the page.
 *
 * What differs from the reference, and why:
 *  - The map library (react-simple-maps + d3 + topojson, the "maps" chunk) and the
 *    geography are fetched only in a real browser, once the section is on its way into
 *    view: never under window.__PRERENDER__, so neither the ~100 KB of path data nor a
 *    preload of the chunk ever lands in the static HTML. The frame's height is reserved
 *    by its aspect ratio from the first render, so nothing moves when the map arrives.
 *  - The geography is self-hosted (/geo/countries-110m.json): the CSP allows only 'self'.
 *  - Colours are tokens through CSS variables (land = surface, borders = hairline,
 *    markets = muted grey, the lit country = foreground). Bangladesh, the origin, is solid
 *    foreground with a mono label; no flag image and no hue.
 *  - The tooltip names the country and its region only. These are stand-in markets, not
 *    AKTCL's (see src/content/markets.ts), so nothing here claims a product or a trade.
 *  - The map is decorative (aria-hidden): the tag list carries the same information as a
 *    real list of toggle buttons. Hover or keyboard focus on a tag lights its country;
 *    a click, a tap or Enter pins it (aria-pressed); Escape lets it go. A tap on the map
 *    pins the country under the finger, since a touch screen has no hover.
 *  - The card never scales and nothing bounces; under reduced motion it jumps to the
 *    pointer instead of gliding after it.
 */

type MapsLib = typeof import('react-simple-maps');
type GeoPathFn = Parameters<NonNullable<GeographiesProps['children']>>[0]['path'];
type Topology = Record<string, unknown>;
type LonLat = [number, number];

const GEO_URL = '/geo/countries-110m.json';

// The frame, in SVG units; its CSS aspect ratio below is the same pair. Mercator like the
// reference, re-centred and pulled back so the whole run of markets is in frame: the
// United States on the left, Japan on the right, South Africa at the foot. Alaska and the
// far Arctic fall outside, as Antarctica does.
const MAP_W = 960;
const MAP_H = 460;
const SCALE = 180;
const CENTER: LonLat = [25, 29];

/** Places the 110m map has no shape for, drawn as a point. [longitude, latitude] */
const POINTS: Record<string, LonLat> = { Singapore: [103.82, 1.35] };
/** Where the origin's label is pinned: central Bangladesh. */
const ORIGIN_AT: LonLat = [90.3, 23.9];

// Tokens only, as CSS colours for the SVG (inline style, where var() always resolves).
const TONE = {
  land: 'hsl(var(--card))',
  market: 'hsl(var(--muted-foreground) / 0.55)',
  lit: 'hsl(var(--foreground))',
  origin: 'hsl(var(--foreground))',
  rule: 'hsl(var(--border))',
} as const;

type Tone = keyof Omit<typeof TONE, 'rule'>;

const shape = (fill: string, cursor: CSSProperties['cursor']): CSSProperties => ({
  fill,
  stroke: TONE.rule,
  strokeWidth: 1,
  // A 1px hairline at any size, like every other rule on the site.
  vectorEffect: 'non-scaling-stroke',
  outline: 'none',
  cursor,
  transition: `fill var(--duration-ui) ${EASE.expoOut}`,
});

// One frozen style per tone, the same object every render: react-simple-maps' Geography
// is memoised, so only the countries whose tone changed are drawn again.
const STYLES = Object.fromEntries(
  (Object.keys(TONE) as (keyof typeof TONE)[])
    .filter((tone): tone is Tone => tone !== 'rule')
    .map((tone) => {
      const style = shape(TONE[tone], tone === 'market' || tone === 'lit' ? 'pointer' : 'default');
      return [tone, { default: style, hover: style, pressed: style }];
    })
) as Record<Tone, { default: CSSProperties; hover: CSSProperties; pressed: CSSProperties }>;

const MARKET_BY_NAME = new Map(markets.map((market) => [market.name, market]));
const ITALIC = [...reachIntro.italic];
const NOTE_ID = 'global-reach-note';

/** d3's geoMercator with this centre, scale and translate, for the few fixed points. */
const project = ([lon, lat]: LonLat): LonLat => {
  const rad = Math.PI / 180;
  const mercY = (degrees: number) => Math.log(Math.tan(Math.PI / 4 + (degrees * rad) / 2));
  return [MAP_W / 2 + SCALE * (lon - CENTER[0]) * rad, MAP_H / 2 - SCALE * (mercY(lat) - mercY(CENTER[1]))];
};

/** SVG units to percentages of the frame, which is what everything laid over it uses. */
const toPercent = ([x, y]: LonLat): LonLat => [(x / MAP_W) * 100, (y / MAP_H) * 100];

const ORIGIN_PCT = toPercent(project(ORIGIN_AT));

/**
 * Where a country's card points: the middle of its largest landmass, so the United States
 * is not pulled towards Alaska, nor Malaysia into the sea between its two halves.
 */
function anchorOf(geo: { geometry?: { type?: string; coordinates?: unknown } }, path: GeoPathFn): LonLat {
  type Shape = Parameters<GeoPathFn['area']>[0];
  const { geometry } = geo;
  if (geometry?.type === 'MultiPolygon' && Array.isArray(geometry.coordinates)) {
    let best: Shape | null = null;
    let bestArea = -1;
    for (const coordinates of geometry.coordinates) {
      const part = { type: 'Polygon', coordinates } as Shape;
      const area = path.area(part);
      if (area > bestArea) {
        bestArea = area;
        best = part;
      }
    }
    if (best) return path.centroid(best) as LonLat;
  }
  return path.centroid(geo as Shape) as LonLat;
}

/** Which market (by world-atlas name) the pointer is over, if any. */
const marketAt = (target: EventTarget | null) =>
  target instanceof Element ? (target.closest('[data-market]')?.getAttribute('data-market') ?? null) : null;

/** Keyboard focus, not the focus a click or a tap leaves behind. */
const isKeyboardFocus = (el: Element) => {
  try {
    return el.matches(':focus-visible');
  } catch {
    return true;
  }
};

/** A lit country and what lit it. `at` pins the card where a finger tapped the map. */
interface Lit {
  name: string;
  from: 'map' | 'tag';
  at?: LonLat;
}

/** Seconds between tags as they come in; the last one starts within 0.6 s. */
const TAG_STAGGER_S = Math.min(0.04, 0.6 / Math.max(1, markets.length - 1));

const GlobalReach = () => {
  const [still] = useState(isStill);
  const sectionRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // The library and the geography arrive together, or not at all (then the frame stays
  // an empty ruled field and the tags still work).
  const [map, setMap] = useState<{ lib: MapsLib; topology: Topology } | null>(null);
  const [mapShown, setMapShown] = useState(false);

  // Three layers, highest first: the pointer (mouse only), keyboard focus on a tag, and
  // what was pinned by a click, a tap or Enter.
  const [hover, setHover] = useState<Lit | null>(null);
  const [focused, setFocused] = useState<Lit | null>(null);
  const [pinned, setPinned] = useState<Lit | null>(null);
  const lit = hover ?? focused ?? pinned;

  /** Card anchors in percent of the frame, by world-atlas name; filled when the map draws. */
  const anchors = useRef<Map<string, LonLat>>(new Map());
  const anchorsFrom = useRef<unknown>(null);
  /** Last pointer position over the frame, in percent. */
  const pointer = useRef<LonLat>([50, 50]);
  const pointerType = useRef('mouse');
  /** The card is following the pointer (or waiting, hidden, for something to light). */
  const following = useRef(true);
  const tipOpen = useRef(false);

  const place = useRef((at: LonLat) => {
    const el = tipRef.current;
    if (!el) return;
    const [x, y] = at;
    el.style.left = `${x}%`;
    el.style.top = `${y}%`;
    // Beside the pointer, turned back inwards near the right edge and dropped below it
    // near the top, so the card stays inside the frame.
    el.style.transform = `translate(${x > 66 ? 'calc(-100% - 1rem)' : '1rem'}, ${y < 32 ? '1rem' : 'calc(-100% - 1rem)'})`;
  }).current;

  // ---- the map: fetched once the section is within a screen and a half of the view ----
  useEffect(() => {
    if (window.__PRERENDER__) return;
    let cancelled = false;
    let started = false;
    const load = () => {
      if (started) return;
      started = true;
      Promise.all([
        import('react-simple-maps'),
        fetch(GEO_URL).then((response) => {
          if (!response.ok) throw new Error(`${GEO_URL}: ${response.status}`);
          return response.json() as Promise<Topology>;
        }),
      ])
        .then(([lib, topology]) => {
          if (!cancelled) setMap({ lib, topology });
        })
        .catch(() => {
          // Decorative: the tag list below says the same thing.
        });
    };

    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      load();
      return () => {
        cancelled = true;
      };
    }
    const stop = observeIntersection(el, { rootMargin: '0px 0px 150% 0px' }, (inZone) => {
      if (!inZone) return;
      stop();
      load();
    });
    return () => {
      cancelled = true;
      stop();
    };
  }, []);

  // A frame after it is drawn, the map fades up in its frame (at once when nothing moves).
  useEffect(() => {
    if (!map || mapShown) return;
    if (still) {
      setMapShown(true);
      return;
    }
    const frame = requestAnimationFrame(() => setMapShown(true));
    return () => cancelAnimationFrame(frame);
  }, [map, mapShown, still]);

  // ---- the card -------------------------------------------------------------------
  const litMarket = lit ? MARKET_BY_NAME.get(lit.name) : undefined;
  const followsPointer = lit !== null && lit === hover && lit.from === 'map';

  // Placed after every render, once the map (a child) has filled in the anchors. Written
  // straight to the element, so following the pointer never re-renders the map.
  useLayoutEffect(() => {
    following.current = !lit || followsPointer;
    const el = tipRef.current;
    if (!el) return;
    const at = !lit ? undefined : followsPointer ? pointer.current : (lit.at ?? anchors.current.get(lit.name));
    const visible = map !== null && litMarket !== undefined && at !== undefined;
    el.style.visibility = visible ? 'visible' : '';
    if (visible && at) {
      if (!tipOpen.current) {
        // Opening: straight to its place, not a glide from wherever it last was.
        el.style.transition = 'none';
        place(at);
        void el.offsetWidth;
        el.style.transition = '';
      } else if (!followsPointer) {
        place(at);
      }
    }
    tipOpen.current = visible;
  });

  const percentOf = (event: ReactPointerEvent): LonLat | null => {
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return null;
    return [((event.clientX - rect.left) / rect.width) * 100, ((event.clientY - rect.top) / rect.height) * 100];
  };

  const onFramePointerMove = (event: ReactPointerEvent) => {
    const at = percentOf(event);
    if (!at) return;
    pointer.current = at;
    if (following.current) place(at);
  };

  const onFramePointerOver = (event: ReactPointerEvent) => {
    if (event.pointerType !== 'mouse') return;
    const name = marketAt(event.target);
    setHover((prev) => {
      if (name) return prev?.from === 'map' && prev.name === name ? prev : { name, from: 'map' };
      return prev?.from === 'map' ? null : prev;
    });
  };

  const onFramePointerLeave = (event: ReactPointerEvent) => {
    if (event.pointerType !== 'mouse') return;
    setHover((prev) => (prev?.from === 'map' ? null : prev));
  };

  const onFramePointerDown = (event: ReactPointerEvent) => {
    pointerType.current = event.pointerType;
    const at = percentOf(event);
    if (at) pointer.current = at;
  };

  // A touch screen has no hover: a tap pins the country under the finger, a second tap
  // (or a tap on the sea) lets it go. A mouse has already lit it by hovering.
  const onFrameClick = (event: ReactMouseEvent) => {
    if (pointerType.current === 'mouse') return;
    const name = marketAt(event.target);
    const at = pointer.current;
    setPinned((prev) => (!name || prev?.name === name ? null : { name, from: 'map', at }));
  };

  // ---- the tags ---------------------------------------------------------------------
  const listPlace = useViewPlace(listRef, { skip: still, threshold: 0.2 });
  const tagsShown = useReveal(listPlace === 'in');

  const tagStyle = (index: number): CSSProperties | undefined =>
    still
      ? undefined
      : {
          opacity: tagsShown ? 1 : 0,
          transform: tagsShown ? 'none' : `translate3d(0, ${listPlace === 'above' ? -16 : 16}px, 0)`,
          transition: revealTransition(tagsShown, ['opacity', 'transform'], 0.8, index * TAG_STAGGER_S),
        };

  const onTagFocus = (market: Market) => (event: FocusEvent<HTMLButtonElement>) => {
    if (isKeyboardFocus(event.currentTarget)) setFocused({ name: market.name, from: 'tag' });
  };

  return (
    <section ref={sectionRef} id="global-reach" aria-labelledby="global-reach-heading" className="relative bg-background">
      <div className="mx-auto max-w-7xl px-4 pb-24 pt-24 sm:px-6 md:pb-32 md:pt-32 lg:pb-36 lg:pt-36">
        <SectionHead label={reachIntro.eyebrow} />

        <SplitReveal
          as="h2"
          id="global-reach-heading"
          text={reachIntro.heading}
          italicWords={ITALIC}
          className="display-lg mt-12 text-foreground md:mt-16 lg:mt-20"
        />
        <Reveal delay={0.12} className="mt-6 md:mt-8">
          <p id={NOTE_ID} className="eyebrow max-w-[36rem]">
            {reachIntro.note}
          </p>
        </Reveal>

        {/* The map, ruled off above and below. Its aspect ratio is the SVG's, so the
            frame holds its height before the map exists (and in the static HTML). */}
        <Reveal className="mt-12 md:mt-16 lg:mt-20">
          <div
            ref={frameRef}
            className="relative aspect-[960/460] border-y border-border"
            onPointerMove={onFramePointerMove}
            onPointerOver={onFramePointerOver}
            onPointerLeave={onFramePointerLeave}
            onPointerDown={onFramePointerDown}
            onClick={onFrameClick}
          >
            {map && (
              <div
                className="absolute inset-0"
                style={
                  still
                    ? undefined
                    : {
                        opacity: mapShown ? 1 : 0,
                        transition: `opacity 0.9s ${EASE.expoOut}`,
                      }
                }
              >
                <map.lib.ComposableMap
                  projection="geoMercator"
                  projectionConfig={{ scale: SCALE, center: CENTER }}
                  width={MAP_W}
                  height={MAP_H}
                  aria-hidden="true"
                  focusable="false"
                  style={{ width: '100%', height: '100%', display: 'block' }}
                >
                  <map.lib.Geographies geography={map.topology}>
                    {({ geographies, path }) => {
                      if (anchorsFrom.current !== geographies) {
                        anchorsFrom.current = geographies;
                        const next = new Map<string, LonLat>();
                        for (const geo of geographies) {
                          const name: string = geo.properties?.name ?? '';
                          if (MARKET_BY_NAME.has(name)) next.set(name, toPercent(anchorOf(geo, path)));
                        }
                        for (const [name, at] of Object.entries(POINTS)) next.set(name, toPercent(project(at)));
                        anchors.current = next;
                      }
                      return geographies.map((geo) => {
                        const name: string = geo.properties?.name ?? '';
                        const market = MARKET_BY_NAME.get(name);
                        const tone: Tone =
                          name === ORIGIN.name ? 'origin' : !market ? 'land' : lit?.name === name ? 'lit' : 'market';
                        return (
                          <map.lib.Geography
                            key={geo.rsmKey}
                            geography={geo}
                            // The library makes every country a tab stop; this map is decorative.
                            tabIndex={undefined}
                            data-market={market ? name : undefined}
                            style={STYLES[tone]}
                          />
                        );
                      });
                    }}
                  </map.lib.Geographies>
                  {markets
                    .filter((market) => !market.onMap && POINTS[market.name])
                    .map((market) => (
                      <map.lib.Marker key={market.name} coordinates={POINTS[market.name]} data-market={market.name}>
                        <circle r={3.5} style={STYLES[lit?.name === market.name ? 'lit' : 'market'].default} />
                      </map.lib.Marker>
                    ))}
                </map.lib.ComposableMap>

                {/* The origin, named in mono at the foot of a short hairline. */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute flex -translate-x-1/2 flex-col items-center"
                  style={{ left: `${ORIGIN_PCT[0]}%`, top: `${ORIGIN_PCT[1]}%` }}
                >
                  <span className="h-3 w-px bg-foreground sm:h-6 md:h-9" />
                  <span className="mono-label mt-1 bg-background px-1.5 text-foreground">{ORIGIN.label}</span>
                </div>
              </div>
            )}

            {/* The card: a duplicate of the lit tag, so hidden from assistive technology. */}
            <div
              ref={tipRef}
              aria-hidden="true"
              className="pointer-events-none invisible absolute left-0 top-0 z-10 motion-safe:transition-[left,top] motion-safe:duration-150"
            >
              {litMarket && (
                <div className="whitespace-nowrap border border-ink-border bg-ink px-4 py-2 text-ink-foreground md:px-5 md:py-3">
                  <p className="display-xs">{litMarket.label}</p>
                  <p className="eyebrow mt-1">{litMarket.region}</p>
                </div>
              )}
            </div>
          </div>
        </Reveal>

        {/* The same markets as a list: the part a screen reader and a crawler read. */}
        <ul
          ref={listRef}
          role="list"
          aria-labelledby={NOTE_ID}
          className="mt-10 flex flex-wrap gap-2 md:mt-12"
          onKeyDown={(event) => {
            if (event.key === 'Escape') setPinned(null);
          }}
        >
          {markets.map((market, i) => {
            const isLit = lit?.name === market.name;
            return (
              <li key={market.name} style={tagStyle(i)}>
                <button
                  type="button"
                  aria-pressed={pinned?.name === market.name}
                  onPointerEnter={(event) => {
                    if (event.pointerType === 'mouse') setHover({ name: market.name, from: 'tag' });
                  }}
                  onPointerLeave={(event) => {
                    if (event.pointerType === 'mouse') setHover((prev) => (prev?.from === 'tag' ? null : prev));
                  }}
                  onFocus={onTagFocus(market)}
                  onBlur={() => setFocused(null)}
                  onClick={() =>
                    setPinned((prev) => (prev?.name === market.name ? null : { name: market.name, from: 'tag' }))
                  }
                  className={cn(
                    'mono-label inline-flex min-h-11 items-center border px-4 transition-colors',
                    isLit
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border text-muted-foreground [@media(hover:hover)]:hover:border-foreground [@media(hover:hover)]:hover:text-foreground'
                  )}
                >
                  {market.label}
                  <span className="sr-only">, {market.region}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
};

export default GlobalReach;
