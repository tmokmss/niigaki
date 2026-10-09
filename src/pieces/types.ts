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

export type PianoPiece = {
  kind: "piano";
  slug: string;
  title: string;
  description: string;
  bpm: number;
  bars: Bar[];
  ostinato?: string[];
  finalBell?: string;
};

// c: root, third, fifth around octave 3-4; m: [note, sixteenths]
export type ChipBar = {
  c: string[];
  m?: [string, number][];
  arp?: boolean;
  bass?: boolean;
  kick?: boolean;
  snare?: boolean;
  roll?: boolean;
  hat?: 8 | 16;
  crash?: boolean;
  harm?: boolean;
};

export type ChipPiece = {
  kind: "chip";
  slug: string;
  title: string;
  description: string;
  bpm: number;
  bars: ChipBar[];
  final: string[];
};

export type Piece = PianoPiece | ChipPiece;
