interface OptionsType {
  readonly any?: "any";
  readonly array?: "array";
  readonly boolean?: "boolean";
  readonly dom?: "dom";
  readonly function?: "function";
  readonly number?: "number";
  readonly object?: "object";
  readonly string?: "string" | readonly string[];
  readonly undefined?: "undefined";
}
export type OptionsConfig = {
  /* eslint-disable-next-line @typescript-eslint/naming-convention -- The __*__ format is used to prevent collisions with actual option names. */
  readonly __type__: {
    readonly object: "object";
  } & OptionsType;
} & {
  readonly [Key in string]: OptionsConfig | OptionsType;
};

/**
 * The value supplied will be used as the initial value.
 */
type CheckboxInput = boolean;
/**
 * The passed text will be used as the initial value. Any text will be accepted
 * afterwards.
 */
type TextInput = string;
/**
 * The passed values will be used as the limits and the initial position of a
 * slider.
 */
type NumberInput = readonly [
  initialValue: number,
  min: number,
  max: number,
  step: number
];
/** Translations for people with poor understanding of TypeScript: the first
 * value always has to be a string but never `"color"`, the rest can be any
 * combination of strings, numbers and booleans.
 */
type DropdownInput = readonly [
  Exclude<string, "color">,
  ...(string | number | boolean)[]
];
/**
 * The first value says this will be a color picker not a dropdown menu. The
 * next value is the initial color.
 */
type ColorInput = readonly ["coor", string];

type ConfiguratorInput =
  | CheckboxInput
  | ColorInput
  | DropdownInput
  | NumberInput
  | TextInput;

export type ConfiguratorConfig = {
  readonly [Key in string]: ConfiguratorConfig | ConfiguratorInput;
};

export type ConfiguratorHideOption = (
  parentPath: readonly string[],
  optionName: string,
  options: any
) => boolean;
