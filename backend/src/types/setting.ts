type Setting = Record<string, string>;

interface StoredSetting {
  created_at: number;
  data: string;
  key: string;
  updated_at: number;
}

export type { Setting, StoredSetting };
