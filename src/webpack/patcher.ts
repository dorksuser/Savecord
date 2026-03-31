// Module patcher utilities
type PatchCallback = (args: any[], ret: any) => any;

interface Patch {
  module: any;
  funcName: string;
  original: Function;
  callback: PatchCallback;
  type: "before" | "after" | "instead";
}

const patches: Patch[] = [];

export const Patcher = {
  before(module: any, funcName: string, callback: PatchCallback) {
    return this.patch(module, funcName, callback, "before");
  },

  after(module: any, funcName: string, callback: PatchCallback) {
    return this.patch(module, funcName, callback, "after");
  },

  instead(module: any, funcName: string, callback: PatchCallback) {
    return this.patch(module, funcName, callback, "instead");
  },

  patch(module: any, funcName: string, callback: PatchCallback, type: "before" | "after" | "instead") {
    if (!module || typeof module[funcName] !== "function") {
      console.error(`[Patcher] Invalid target: ${funcName}`);
      return () => {};
    }

    const original = module[funcName];
    const patch: Patch = { module, funcName, original, callback, type };

    module[funcName] = function (...args: any[]) {
      if (type === "before") {
        const result = callback(args, null);
        if (result !== undefined) args = result;
      }

      if (type === "instead") {
        return callback(args, original.bind(this, ...args));
      }

      const ret = original.apply(this, args);

      if (type === "after") {
        return callback(args, ret) ?? ret;
      }

      return ret;
    };

    patches.push(patch);

    return () => this.unpatch(patch);
  },

  unpatch(patch: Patch) {
    const idx = patches.indexOf(patch);
    if (idx === -1) return;

    patch.module[patch.funcName] = patch.original;
    patches.splice(idx, 1);
  },

  unpatchAll() {
    for (const patch of patches) {
      patch.module[patch.funcName] = patch.original;
    }
    patches.length = 0;
  },
};
