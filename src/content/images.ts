/**
 * Image registry — the only place photography is imported.
 *
 * Masters live in src/assets (written by `npm run images:import`). The import
 * queries below make vite-imagetools emit AVIF + WebP at three widths per image, and
 * <LazyImage> picks the right one. Keep the query shape identical across imports so
 * the ambient type in vite-env.d.ts ("*&as=picture") keeps matching.
 *
 * Alt text describes what is visibly in the frame. It deliberately makes no claim
 * about where a photo was taken.
 */
import type { ResponsiveImage } from '@/components/LazyImage';

import heroField from '@/assets/hero/hero-field.webp?w=768;1280;1920&format=avif;webp&quality=72&as=picture';
import heroSeedToSmoke from '@/assets/hero/hero-seed-to-smoke.webp?w=768;1280;1920&format=avif;webp&quality=72&as=picture';
import wtMiddleEast from '@/assets/hero/wt-middle-east.webp?w=768;1280;1920&format=avif;webp&quality=82&as=picture';
import wtAsia from '@/assets/hero/wt-asia.webp?w=768;1280;1920&format=avif;webp&quality=82&as=picture';

import seed1 from '@/assets/journey/seed-1.webp?w=640;1024;1600&format=avif;webp&quality=72&as=picture';
import seed2 from '@/assets/journey/seed-2.webp?w=640;1024;1600&format=avif;webp&quality=72&as=picture';
import seed3 from '@/assets/journey/seed-3.webp?w=640;1024;1600&format=avif;webp&quality=72&as=picture';
import seed4 from '@/assets/journey/seed-4.webp?w=640;1024;1600&format=avif;webp&quality=72&as=picture';
import seed5 from '@/assets/journey/seed-5.webp?w=640;1024;1600&format=avif;webp&quality=72&as=picture';

import harvest1 from '@/assets/journey/harvest-1.webp?w=640;1024;1600&format=avif;webp&quality=72&as=picture';
import harvest2 from '@/assets/journey/harvest-2.webp?w=640;1024;1600&format=avif;webp&quality=72&as=picture';
import harvest3 from '@/assets/journey/harvest-3.webp?w=640;1024;1600&format=avif;webp&quality=72&as=picture';
import harvest4 from '@/assets/journey/harvest-4.webp?w=640;1024;1600&format=avif;webp&quality=72&as=picture';

import cure1 from '@/assets/journey/cure-1.webp?w=640;1024;1600&format=avif;webp&quality=72&as=picture';
import cure2 from '@/assets/journey/cure-2.webp?w=640;1024;1600&format=avif;webp&quality=72&as=picture';
import cure3 from '@/assets/journey/cure-3.webp?w=640;1024;1600&format=avif;webp&quality=72&as=picture';
import cure4 from '@/assets/journey/cure-4.webp?w=640;1024;1600&format=avif;webp&quality=72&as=picture';

import buying1 from '@/assets/journey/buying-1.webp?w=640;1024;1600&format=avif;webp&quality=72&as=picture';
import buying2 from '@/assets/journey/buying-2.webp?w=640;1024;1600&format=avif;webp&quality=72&as=picture';
import buying3 from '@/assets/journey/buying-3.webp?w=640;1024;1600&format=avif;webp&quality=72&as=picture';
import buying4 from '@/assets/journey/buying-4.webp?w=640;1024;1600&format=avif;webp&quality=72&as=picture';

import process1 from '@/assets/journey/process-1.webp?w=640;1024;1600&format=avif;webp&quality=72&as=picture';
import process2 from '@/assets/journey/process-2.webp?w=640;1024;1600&format=avif;webp&quality=72&as=picture';
import process3 from '@/assets/journey/process-3.webp?w=640;1024;1600&format=avif;webp&quality=72&as=picture';

import manufacture1 from '@/assets/journey/manufacture-1.webp?w=640;1024;1600&format=avif;webp&quality=72&as=picture';
import manufacture2 from '@/assets/journey/manufacture-2.webp?w=640;1024;1600&format=avif;webp&quality=72&as=picture';
import manufacture3 from '@/assets/journey/manufacture-3.webp?w=640;1024;1600&format=avif;webp&quality=72&as=picture';

import smoke1 from '@/assets/journey/smoke-1.webp?w=640;1024;1600&format=avif;webp&quality=72&as=picture';

import fcv1 from '@/assets/products/virginia-flue-cured-1.webp?w=480;800;1200&format=avif;webp&quality=72&as=picture';
import fcv2 from '@/assets/products/virginia-flue-cured-2.webp?w=480;800;1200&format=avif;webp&quality=72&as=picture';
import burley1 from '@/assets/products/burley-1.webp?w=480;800;1200&format=avif;webp&quality=72&as=picture';
import burley2 from '@/assets/products/burley-2.webp?w=480;800;1200&format=avif;webp&quality=72&as=picture';
import cutrag from '@/assets/products/cutrag.webp?w=480;800;1200&format=avif;webp&quality=72&as=picture';
import cres from '@/assets/products/cres.webp?w=480;800;1200&format=avif;webp&quality=72&as=picture';
import diet from '@/assets/products/diet.webp?w=480;800;1200&format=avif;webp&quality=72&as=picture';
import stem from '@/assets/products/stem.webp?w=480;800;1200&format=avif;webp&quality=72&as=picture';
import scrap from '@/assets/products/scrap.webp?w=480;800;1200&format=avif;webp&quality=72&as=picture';
import recon from '@/assets/products/recon.webp?w=480;800;1200&format=avif;webp&quality=72&as=picture';
import kingSize from '@/assets/products/king-size.webp?w=480;800;1200&format=avif;webp&quality=72&as=picture';

// Brand marks (logos, not photographs): drawn small, so two widths are plenty, and WebP
// only — AVIF's alpha buys nothing on a few KB of flat artwork.
import aris from '@/assets/brands/aris.webp?w=320;640&format=webp&quality=88&as=picture';
import avon from '@/assets/brands/avon.webp?w=320;640&format=webp&quality=88&as=picture';
import blackDiamond from '@/assets/brands/black-diamond.webp?w=320;640&format=webp&quality=88&as=picture';
import marise from '@/assets/brands/marise.webp?w=320;640&format=webp&quality=88&as=picture';
import maxim from '@/assets/brands/maxim.webp?w=320;640&format=webp&quality=88&as=picture';
import supreme from '@/assets/brands/supreme.webp?w=320;640&format=webp&quality=88&as=picture';

export interface SiteImage {
  image: ResponsiveImage;
  alt: string;
  /**
   * CSS object-position for tight crops (the sticky journey panels show a 4:3 photo
   * in a tall half-viewport frame, so the subject has to be kept in shot).
   */
  position?: string;
}

const img = (image: ResponsiveImage, alt: string, position?: string): SiteImage => ({
  image,
  alt,
  position,
});

export const heroImages: SiteImage[] = [
  img(heroField, 'Two farmers tending rows of tobacco plants in a wide field at sunrise', '35% 60%'),
  img(
    heroSeedToSmoke,
    'Five panels side by side: seeded soil, young tobacco plants, leaves hanging to cure, cured leaf and cut tobacco, and plain cigarette packs',
    '50% 50%'
  ),
];

export interface HeroSlide {
  image: SiteImage;
  /**
   * false on a slide that carries its own words: the headline is kept in the page for
   * its heading and its accessible name, but taken off the screen.
   */
  headline: boolean;
  /**
   * 'cover' is photography, which may be cropped anywhere. 'contain' is designed
   * artwork: it may lose its empty margins to a crop, but never its ink — the hero
   * fits the whole frame on the ink wherever covering would reach the artwork itself
   * (see HeroCarousel).
   */
  fit: 'cover' | 'contain';
  /**
   * true where the picture is dark enough to carry the hero's white controls. The two
   * banners are drawn on near-white (measured: 0.87 luminance), so their controls are
   * set in black instead.
   */
  dark: boolean;
  /** For the carousel's slide labels. */
  label: string;
}

/**
 * The hero rotation. The photograph carries the headline; the two event banners are
 * artwork with their own words, so the headline steps aside while they are up.
 *
 * TODO(Asef): the banners are dated — WT Asia 22–23 October 2026, WT Middle East
 * 10–11 November 2026. Take them out of this list once the events have passed.
 *
 * Artwork replaced 2026-09-23 (second version, wider margins): the ink now sits in the
 * middle 39% of the frame on the WT Middle East banner and 29% on WT Asia, which is what
 * lets the hero crop them to fill the screen. Re-measure both if they are replaced again.
 */
export const heroSlides: HeroSlide[] = [
  { image: img(heroField, 'Two farmers tending rows of tobacco plants in a wide field at sunrise', '35% 60%'), headline: true, fit: 'cover', dark: true, label: 'From Seed to Smoke' },
  {
    image: img(wtMiddleEast, 'Join us at WT Middle East, 10–11 November 2026, Dubai, UAE — stall 7165'),
    headline: false,
    fit: 'contain',
    dark: false,
    label: 'WT Middle East 2026',
  },
  {
    image: img(wtAsia, 'Join us at WT Asia, 22–23 October 2026, Surabaya, Indonesia — stall A05'),
    headline: false,
    fit: 'contain',
    dark: false,
    label: 'WT Asia 2026',
  },
];

/** Keyed by journey stage slug. The first image is the stage's cover. */
export const journeyImages: Record<string, SiteImage[]> = {
  seed: [
    img(seed5, 'Two growers holding a small scoop of tobacco seed above a tobacco field at sunset', '45% 60%'),
    img(seed2, 'Tobacco seedbeds under low net tunnels, with a worker tending the rows', '50% 60%'),
    img(seed3, 'Rows of tobacco seedlings, some covered by net tunnels, beside green paddy fields', '50% 60%'),
    img(seed1, 'Young tobacco seedlings growing in a raised nursery bed edged with bamboo', '40% 60%'),
    img(seed4, 'Newly transplanted tobacco seedlings in tilled soil on a misty morning', '50% 65%'),
  ],
  harvest: [
    img(harvest3, 'Harvesters carrying armfuls of ripe tobacco leaves through a field at sunrise', '45% 50%'),
    img(harvest1, 'Hands passing a bundle of freshly picked yellow-green tobacco leaves', '50% 55%'),
    img(harvest2, 'A harvester holding a bunch of ripe tobacco leaves in a field at sunrise', '45% 50%'),
    img(harvest4, 'Hands holding a large green tobacco leaf beaded with water', '45% 60%'),
  ],
  cure: [
    img(cure4, 'Long curing barn with tiers of tobacco leaves drying on bamboo racks, lit by a shaft of sunlight', '50% 50%'),
    img(cure2, 'Golden tobacco leaves hanging in tiers inside a flue-curing barn beside a clay furnace', '50% 50%'),
    img(cure3, 'Tobacco leaves strung on bamboo poles curing under a thatched roof', '50% 50%'),
    img(cure1, 'Cured tobacco leaves hanging from timber racks above a glowing furnace', '50% 50%'),
  ],
  buying: [
    img(buying2, 'A buyer inspecting a cured tobacco leaf over a bale at a buying floor, with a weighing scale behind', '50% 50%'),
    img(buying1, 'Buyers and farmers examining bales of cured tobacco leaf at a buying centre', '45% 55%'),
    img(buying3, 'A team grading cured tobacco leaf on the floor of a covered buying shed', '50% 55%'),
    img(buying4, 'Workers sorting and grading cured tobacco leaves along a line of bales', '40% 50%'),
  ],
  process: [
    img(process2, 'Workers picking over tobacco leaf on a conveyor inside a green leaf threshing plant', '55% 60%'),
    img(process1, 'A long stainless-steel leaf conditioning and drying line on a clean factory floor', '55% 50%'),
    img(process3, 'Processed tobacco rising on an inclined conveyor inside a modern processing hall', '50% 60%'),
  ],
  manufacture: [
    img(manufacture1, 'A high-speed cigarette making line on a factory floor', '50% 55%'),
    img(manufacture3, 'Cigarette packing machinery viewed from above on a factory floor', '50% 55%'),
    img(manufacture2, 'A filter-rod making machine with its operator touchscreen on a factory floor', '50% 60%'),
  ],
  smoke: [
    img(smoke1, 'Plain white cigarette packs and filter cigarettes arranged on a brushed-metal surface', '50% 50%'),
  ],
};

/** Keyed by product slug. Products missing here have no dedicated photography yet. */
export const productImages: Record<string, SiteImage[]> = {
  'virginia-flue-cured': [
    img(fcv1, 'A fan of golden flue-cured Virginia tobacco leaves on a white background'),
    img(fcv2, 'A stack of golden flue-cured Virginia tobacco leaves on a white background'),
  ],
  burley: [
    img(burley1, 'A fan of light-brown Burley tobacco leaves on a white background'),
    img(burley2, 'Overlapping light-brown Burley tobacco leaves on a white background'),
  ],
  cutrag: [img(cutrag, 'A mound of fine cut rag tobacco on a white background')],
  cres: [img(cres, 'A small heap of cut, rolled and expanded tobacco stem on a white background')],
  diet: [img(diet, 'A heap of light, expanded cut tobacco on a white background')],
  stem: [img(stem, 'A pile of tobacco stems on a white background')],
  scrap: [img(scrap, 'A heap of tobacco scrap, small broken leaf pieces, on a white background')],
  recon: [img(recon, 'A stack of reconstituted tobacco sheets on a white background')],
};

/** Cover image per category (also used for products that have none of their own). */
export const categoryImages: Record<string, SiteImage> = {
  'leaf-tobacco': img(fcv1, 'A fan of golden flue-cured Virginia tobacco leaves on a white background'),
  'finished-cigarettes': img(
    kingSize,
    'Two plain white king-size cigarette packs, one open showing filter cigarettes'
  ),
};

/**
 * Brand marks for the AKT Signature Collection, keyed by the slug in products.ts.
 * Each alt is the brand's name and nothing more: a logo says who, not what.
 */
export const brandImages: Record<string, SiteImage> = {
  aris: img(aris, 'ARIS'),
  avon: img(avon, 'AVON'),
  'black-diamond': img(blackDiamond, 'Black Diamond'),
  marise: img(marise, 'MARISE'),
  maxim: img(maxim, 'MAXIM'),
  supreme: img(supreme, 'SUPREME'),
};

/** Homepage gallery — drawn from the journey photography, in value-chain order. */
export const galleryImages: SiteImage[] = [
  journeyImages.seed[1],
  journeyImages.seed[0],
  journeyImages.harvest[0],
  journeyImages.harvest[3],
  journeyImages.cure[0],
  journeyImages.cure[1],
  journeyImages.buying[1],
  journeyImages.buying[3],
  journeyImages.process[0],
  journeyImages.process[1],
  journeyImages.manufacture[0],
  journeyImages.manufacture[1],
];
