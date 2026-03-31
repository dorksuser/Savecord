export class Storage {
  private data: Record<string, any> = {};

  constructor() {
    const stored = localStorage.getItem("noir-client");
    if (stored) this.data = JSON.parse(stored);
  }

  get<T>(key: string, defaultValue?: T): T {
    return this.data[key] ?? defaultValue;
  }

  set(key: string, value: any) {
    this.data[key] = value;
    localStorage.setItem("noir-client", JSON.stringify(this.data));
  }

  delete(key: string) {
    delete this.data[key];
    localStorage.setItem("noir-client", JSON.stringify(this.data));
  }
}
