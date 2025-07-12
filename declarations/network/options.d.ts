import type { ConfiguratorConfig, ConfiguratorHideOption, OptionsConfig } from "vis-util/esnext";
declare const allOptions: OptionsConfig;
/**
 * This provides ranges, initial values, steps and dropdown menu choices for the
 * configuration.
 * @remarks
 * Checkbox: `boolean`
 *   The value supllied will be used as the initial value.
 *
 * Text field: `string`
 *   The passed text will be used as the initial value. Any text will be
 *   accepted afterwards.
 *
 * Number range: `[number, number, number, number]`
 *   The meanings are `[initial value, min, max, step]`.
 *
 * Dropdown: `[Exclude<string, "color">, ...(string | number | boolean)[]]`
 *   Translations for people with poor understanding of TypeScript: the first
 *   value always has to be a string but never `"color"`, the rest can be any
 *   combination of strings, numbers and booleans.
 *
 * Color picker: `["color", string]`
 *   The first value says this will be a color picker not a dropdown menu. The
 *   next value is the initial color.
 */
declare const configureOptions: ConfiguratorConfig;
export declare const configuratorHideOption: ConfiguratorHideOption;
export { allOptions, configureOptions };
//# sourceMappingURL=options.d.ts.map