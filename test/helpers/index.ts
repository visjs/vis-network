/**
 * Prevents supplied object from being modified.
 *
 * @remarks
 * Has no problem with cycles.
 * Can receive frozen or parially frozen objects.
 * @typeParam T - The type of the object.
 * @param object - The object to be recursively frozen.
 * @param freeze - Function that does the freezing. Object.seal or anything with the same API can be used instead.
 * @returns The frozen object (the same instance as object param).
 */
export function deepFreeze<T extends object>(
  object: T,
  freeze: (object: any) => any = (object: any[]): any => Object.freeze(object)
): T {
  const alreadyFrozen = new Set<any>();

  /**
   * Recursivelly freezes objects using alreadyFrozen to prevent infinite cycles.
   *
   * @param object - The object to be recursively frozen.
   * @returns The frozen object (the same instance as object param).
   */
  function recursivelyFreeze(object: any): any {
    // Prevent double freezing (could lead to stack overflow due to an infinite cycle)
    // Object.isFrozen is not used here because frozen objects can have unfrozen objects in their properties.
    if (alreadyFrozen.has(object)) {
      return object;
    }
    alreadyFrozen.add(object);

    // Retrieve the property names defined on object
    const names = Object.getOwnPropertyNames(object);

    // Freeze properties before freezing the object
    for (const name of names) {
      const prop = object[name];
      if (prop && typeof prop === "object") {
        recursivelyFreeze(prop);
      } else {
        freeze(prop);
      }
    }

    return freeze(object);
  }

  return recursivelyFreeze(object);
}

/**
 * Sort arrays in given input.
 *
 * @remarks
 * This is intended to be used with assertions when the order doesn't matter.
 * @param input - The input whose arrays should be sorted (in-place).
 * @returns The input (same reference).
 */
export function sortArrays<T>(input: any): T {
  if (Array.isArray(input)) {
    input.sort();
  }

  if (typeof input === "object" && input !== null) {
    for (const key of Reflect.ownKeys(input)) {
      sortArrays(input[key]);
    }
  }

  return input;
}
