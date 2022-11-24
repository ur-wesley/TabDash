export interface DB {
  version: string;
  firefox: Stats;
  chrome: Stats;
  settings: Setting[];
}

export interface Stats {
  install: string[];
  deinstall: string[];
}

export interface Setting {
  [id: string]: string;
}
