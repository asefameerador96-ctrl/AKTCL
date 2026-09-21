import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ORIGIN, markets } from '@/content/markets';

// The geography the Global Reach map draws (self-hosted world-atlas 2, countries-110m).
// Read as a file, so this runs without the map library. vitest runs from the repo root.
const topology = JSON.parse(readFileSync(resolve(process.cwd(), 'public/geo/countries-110m.json'), 'utf8')) as {
  objects: { countries: { geometries: { properties?: { name?: string } }[] } };
};
const shapes = new Set(topology.objects.countries.geometries.map((g) => g.properties?.name ?? ''));

describe('Global Reach markets', () => {
  it('names every market with onMap: true as a country shape in the map geography', () => {
    for (const market of markets.filter((m) => m.onMap)) {
      expect(shapes.has(market.name), `"${market.name}" is a properties.name in countries-110m.json`).toBe(true);
    }
  });

  it('marks a market onMap: false only where the map really has no shape for it', () => {
    for (const market of markets.filter((m) => !m.onMap)) {
      expect(shapes.has(market.name), `"${market.name}" has a shape, so it should be onMap: true`).toBe(false);
    }
  });

  it('has the origin on the map, and not as a market', () => {
    expect(shapes.has(ORIGIN.name)).toBe(true);
    expect(markets.some((m) => m.name === ORIGIN.name)).toBe(false);
  });

  it('lists each market once, with a label', () => {
    const names = markets.map((m) => m.name);
    expect(new Set(names).size).toBe(names.length);
    for (const market of markets) expect(market.label.trim().length, market.name).toBeGreaterThan(0);
  });
});
