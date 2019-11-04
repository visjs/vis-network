export class PollutionDetector {
  private _originalValues: Map<
    string,
    {
      path: string;
      root: unknown;
      value: unknown;
    }
  > = new Map();
  private _saved: {
    prefix: string;
    root: any;
    whitelist: Set<string>;
  }[] = [];

  private async _traverse({
    callback,
    done,
    prefix,
    root,
    whitelist
  }: {
    callback: (value: unknown, path: string) => boolean;
    done: Set<unknown>;
    prefix: string;
    root: any;
    whitelist: Set<string>;
  }): Promise<void> {
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
            whitelist
          });
        }
      } catch (_error) {}
    }
  }

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
      }
    });
    return saved;
  }

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
        whitelist
      });
    }

    return { added, changed, missing };
  }

  public clear() {
    this._originalValues.clear();
    this._saved.length = 0;
  }
}
