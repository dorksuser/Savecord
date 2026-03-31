// Webpack utilities inspired by Vencord
type FilterFn = (module: any) => boolean;

const cache = new Map<string, any>();

export const Webpack = {
  _modules: null as any,

  get modules() {
    if (this._modules) return this._modules;
    
    const wpChunk = (window as any).webpackChunkdiscord_app;
    if (!wpChunk) return null;

    wpChunk.push([
      [Symbol()],
      {},
      (req: any) => {
        this._modules = req.c;
      },
    ]);

    return this._modules;
  },

  find(filter: FilterFn, { all = false } = {}): any {
    const modules = this.modules;
    if (!modules) return all ? [] : null;

    const results: any[] = [];

    for (const id in modules) {
      const mod = modules[id];
      if (!mod?.exports) continue;

      if (filter(mod.exports)) {
        if (!all) return mod.exports;
        results.push(mod.exports);
      }

      if (mod.exports.default && filter(mod.exports.default)) {
        if (!all) return mod.exports.default;
        results.push(mod.exports.default);
      }
    }

    return all ? results : null;
  },

  findByProps(...props: string[]): any {
    const cacheKey = `props:${props.join(",")}`;
    if (cache.has(cacheKey)) return cache.get(cacheKey);

    const result = this.find((m) => {
      if (typeof m !== "object" || !m) return false;
      return props.every((prop) => prop in m);
    });

    if (result) cache.set(cacheKey, result);
    return result;
  },

  findByCode(...code: string[]): any {
    const cacheKey = `code:${code.join(",")}`;
    if (cache.has(cacheKey)) return cache.get(cacheKey);

    const result = this.find((m) => {
      if (typeof m !== "function") return false;
      const str = m.toString();
      return code.every((c) => str.includes(c));
    });

    if (result) cache.set(cacheKey, result);
    return result;
  },

  findByDisplayName(name: string): any {
    const cacheKey = `displayName:${name}`;
    if (cache.has(cacheKey)) return cache.get(cacheKey);

    const result = this.find((m) => m?.displayName === name);

    if (result) cache.set(cacheKey, result);
    return result;
  },

  waitFor(filter: FilterFn, callback: (module: any) => void) {
    const existing = this.find(filter);
    if (existing) return callback(existing);

    const interval = setInterval(() => {
      const mod = this.find(filter);
      if (mod) {
        clearInterval(interval);
        callback(mod);
      }
    }, 100);
  },
};
