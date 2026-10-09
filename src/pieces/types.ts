export type Bar = {
  c: string[];
  c2?: string[];
  m: [string, number][];
  s?: number;
  lh?: boolean;
  mel?: boolean;
  oct?: boolean;
  bell?: boolean;
  ost?: boolean;
  pad?: boolean;
};

export type Piece = {
  slug: string;
  title: string;
  description: string;
  bpm: number;
  bars: Bar[];
  ostinato?: string[];
  finalBell?: string;
};
