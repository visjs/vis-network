/**
 * Normalizes language code into the format used internally.
 *
 * @param locales - All the available locales.
 * @param rawCode - The original code as supplied by the user.
 * @returns Language code in the format language-COUNTRY or language, eventually
 * fallbacks to en.
 */
export function normalizeLanguageCode(
  locales: Record<string, undefined | object>,
  rawCode: string
): string {
  try {
    const [rawLanguage, rawCountry] = rawCode.split(/[-_ /]/, 2);
    const language = rawLanguage != null ? rawLanguage.toLowerCase() : null;
    const country = rawCountry != null ? rawCountry.toUpperCase() : null;

    if (language && country) {
      const code = language + "-" + country;
      if (Object.prototype.hasOwnProperty.call(locales, code)) {
        return code;
      } else {
        console.warn(`Unknown variant ${country} of language ${language}.`);
      }
    }

    if (language) {
      const code = language;
      if (Object.prototype.hasOwnProperty.call(locales, code)) {
        return code;
      } else {
        console.warn(`Unknown language ${language}`);
      }
    }

    console.warn(`Unknown locale ${rawCode}, falling back to English.`);

    return "en";
  } catch (error) {
    console.error(error);
    console.warn(
      `Unexpected error while normalizing locale ${rawCode}, falling back to English.`
    );

    return "en";
  }
}
