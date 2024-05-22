interface TraverseParameters {
  /**
   * Callback that is executed for each value found during traversal.
   *
   * @param value - Current value.
   * @param path - Path to the value in dot notation.
   * @returns True to investigate this value further, false to ignore this
   * value's descendants.
   */
  callback: (value: unknown, path: string) => boolean;
  /**
   * A set of values that have already been processed. Should be an empty set
   * if this is the first invocation. It's purpose is to prevent infinite
   * cycling on cyclic references.
   */
  done: Set<unknown>;
  /**
   * The path to the root in dot notation.
   */
  prefix: string;
  /**
   * The object to be traversed from.
   */
  root: any;
  /**
   * A set of paths to be ignored during traversal. This includes all
   * descendants of given paths.
   */
  whitelist: Set<string>;
}

/**
 * Recursively saves the current state of supplied objects (intended for window
 * or global but will work with any object) and checks for additions, changes
 * and removals later on. The purpose of this is to identify problems like
 * prototype pollution etc.
 */
export class PollutionDetector {
  private readonly _originalValues: Map<
    string,
    {
      path: string;
      root: unknown;
      value: unknown;
    }
  > = new Map();
  private readonly _saved: {
    prefix: string;
    root: any;
    whitelist: Set<string>;
  }[] = [];

  /**
   * Traverses the provided object ommiting whitelisted paths, getters and
   * ignoring exceptions.
   *
   * @param root0
   * @param root0.callback
   * @param root0.done
   * @param root0.prefix
   * @param root0.root
   * @param root0.whitelist
   */
  private async _traverse({
    callback,
    done,
    prefix,
    root,
    whitelist,
  }: TraverseParameters): Promise<void> {
    if (done.has(root)) {
      return;
    } else {
      done.add(root);
    }

    for (const key of Object.getOwnPropertyNames(root).sort()) {
      const path = prefix + "." + key;

      if (
        // whitelisted
        whitelist.has(path) ||
        // getter
        (Object.getOwnPropertyDescriptor(root, key) || {}).get
      ) {
        continue;
      }

      try {
        // This may throw async inovcation error hence the trycatch.
        const value = await root[key];

        if (callback(value, path) && Object(value) === value) {
          // object
          await this._traverse({
            callback,
            done,
            prefix: path,
            root: value,
            whitelist,
          });
        }
      } catch (_error) {
        // If it throws there's nothing that can be done about it.
      }
    }
  }

  /**
   * Recursively save current state.
   *
   * @param prefix - The path to the root in dot notation.
   * @param root - The object to be traversed from.
   * @param whitelist - A set of paths to be ignored during traversal. This
   * includes all descendants of given paths.
   * @returns A set of all saved paths.
   */
  public async save(
    prefix: string,
    root: any,
    whitelist: string[] | Set<string> = []
  ): Promise<Set<string>> {
    whitelist = whitelist instanceof Set ? whitelist : new Set(whitelist);
    this._saved.push({ prefix, root, whitelist });

    const saved: Set<string> = new Set();
    await this._traverse({
      done: new Set(),
      prefix,
      root,
      whitelist,

      callback: (value, path): boolean => {
        this._originalValues.set(path, { path, root, value });
        saved.add(path);
        return true;
      },
    });
    return saved;
  }

  /**
   * Recursively check the differences between current state and saved state.
   *
   * @returns Sets listing paths of found differences (additions, changes and deletions).
   */
  public async check(): Promise<{
    added: Set<string>;
    changed: Set<string>;
    missing: Set<string>;
  }> {
    const added: Set<string> = new Set();
    const changed: Set<string> = new Set();
    const missing = new Set(this._originalValues.keys());

    for (const { prefix, root, whitelist } of this._saved) {
      await this._traverse({
        callback: (value, path): boolean => {
          missing.delete(path);

          const original = this._originalValues.get(path);

          if (typeof original === "undefined") {
            // new property
            added.add(path);
            return false;
          } else if (original.value !== original.value) {
            // NaN
            if (value === value) {
              changed.add(path);
            }
          } else {
            // object, primitve
            if (original.value !== value) {
              changed.add(path);
            }
          }

          return true;
        },
        done: new Set(),
        prefix,
        root,
        whitelist,
      });
    }

    return { added, changed, missing };
  }

  /**
   * Delete all saved states.
   */
  public clear() {
    this._originalValues.clear();
    this._saved.length = 0;
  }
}
