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
export declare type OptionsConfig = {
    readonly __type__: {
        readonly object: "object";
    } & OptionsType;
} & {
    readonly [Key in string]: OptionsConfig | OptionsType;
};
/**
 * The value supplied will be used as the initial value.
 */
declare type CheckboxInput = boolean;
/**
 * The passed text will be used as the initial value. Any text will be accepted
 * afterwards.
 */
declare type TextInput = string;
/**
 * The passed values will be used as the limits and the initial position of a
 * slider.
 */
declare type NumberInput = readonly [
    initialValue: number,
    min: number,
    max: number,
    step: number
];
/** Translations for people with poor understanding of TypeScript: the first
 * value always has to be a string but never `"color"`, the rest can be any
 * combination of strings, numbers and booleans.
 */
declare type DropdownInput = readonly [
    Exclude<string, "color">,
    ...(string | number | boolean)[]
];
/**
 * The first value says this will be a color picker not a dropdown menu. The
 * next value is the initial color.
 */
declare type ColorInput = readonly ["coor", string];
declare type ConfiguratorInput = CheckboxInput | ColorInput | DropdownInput | NumberInput | TextInput;
export declare type ConfiguratorConfig = {
    readonly [Key in string]: ConfiguratorConfig | ConfiguratorInput;
};
export declare type ConfiguratorHideOption = (parentPath: readonly string[], optionName: string, options: any) => boolean;
export {};
//# sourceMappingURL=configurator-types.d.ts.map