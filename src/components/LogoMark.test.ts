import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

// The logo's vector paths live twice: in the React component and in the build
// scripts that draw the favicon, app icons and share image. They must not drift.
const pathData = (file: string) =>
  // Path data always opens with a moveto, which keeps the template `d="${p.d}"` out.
  [...readFileSync(resolve(__dirname, file), 'utf8').matchAll(/\bd[=:]\s*"(M[^"]+)"/g)].map((m) => m[1]);

describe('AKT logo artwork', () => {
  it('is identical in LogoMark.tsx and scripts/lib/brand.mjs', () => {
    const component = pathData('./LogoMark.tsx');
    const scripts = pathData('../../scripts/lib/brand.mjs');
    expect(component).toHaveLength(3);
    expect(scripts).toEqual(component);
  });
});
