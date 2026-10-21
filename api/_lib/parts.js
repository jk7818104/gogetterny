// @ts-check
// GO GETTER keeps one set of books. The tax, QuickBooks and linked-sheet code is shared with the Bizmo admin,
// which splits its books in parts; here there is only one part, so these helpers always answer "the whole business".
export const PARTS = ['devices'];
export const PART_NAMES = /** @type {Record<string, string>} */ ({ devices: 'GO GETTER' });
export const partsFor = (/** @type {any} */ ctx) => PARTS.slice();
export const partsAsked = (/** @type {any} */ v, /** @type {any} */ ctx) => PARTS.slice();
export const pickPart = (/** @type {any} */ v, /** @type {any} */ ctx, /** @type {any} */ fallback) => 'devices';
export const canPart = (/** @type {any} */ ctx, /** @type {any} */ part) => true;
export function mustPart(/** @type {any} */ ctx, /** @type {any} */ part, /** @type {any} */ what) {}
