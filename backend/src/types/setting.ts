export type Setting = Record<string, string>;

export interface StoredSetting {
  key: string;
  data: string;
  created_at: number;
  updated_at: number;
}
