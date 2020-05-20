/**
 * Normalizes language code into the format used internally.
 *
 * @param locales - All the available locales.
 * @param rawCode - The original code as supplied by the user.
 *
 * @returns Language code in the format language-COUNTRY or language, eventually
 * fallbacks to en.
 */
export declare function normalizeLanguageCode(locales: Record<string, undefined | object>, rawCode: string): string;
//# sourceMappingURL=locale-utils.d.ts.map