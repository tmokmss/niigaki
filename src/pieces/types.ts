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

// c: root, third, fifth around octave 3-4; m: [note, sixteenths], "-" for a rest, "~" to hold the previous note
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
  beats?: 3 | 4;
  groove: "four" | "half" | "break" | "three";
  bassline: "octave" | "fifth" | "pulse";
  timbre?: "square" | "reed" | "bright" | "flute" | "pluck";
  visual?: "danmaku";
  // danmaku colour palette, advanced on each crash
  hues?: number[];
  bars: ChipBar[];
};

// c: chord with its 7th/9th, root A3-G4 first; c2: chord for beats 3-4; open: low-pass opening 0-1, reached by the end of the bar
export type FutureBar = {
  c: string[];
  c2?: string[];
  m?: [string, number][];
  chord?: "pad" | "stab" | "wobble";
  open?: number;
  bass?: boolean;
  kick?: boolean;
  clap?: boolean;
  hat?: boolean;
  roll?: 4 | 8 | 16 | 32;
  riser?: boolean;
  gap?: boolean;
  crash?: boolean;
};

export type FuturePiece = {
  kind: "future";
  slug: string;
  title: string;
  description: string;
  bpm: number;
  visual?: "danmaku";
  hues?: number[];
  bars: FutureBar[];
};

// c: chord with its 7th/9th/11th, root A3-G4 first; c2: chord for beats 3-4
// m: [note, steps] with 24 steps (sixteenth-note triplets) per bar, so the sixteenths of two 3/4 bars fill one bar
// open: low-pass opening 0-1, reached by the end of the bar
export type LofiBar = {
  c: string[];
  c2?: string[];
  m?: [string, number][];
  beat?: boolean;
  bass?: boolean;
  open?: number;
  crash?: boolean;
};

export type LofiPiece = {
  kind: "lofi";
  slug: string;
  title: string;
  description: string;
  bpm: number;
  visual?: "danmaku";
  hues?: number[];
  bars: LofiBar[];
};

export type Piece = PianoPiece | ChipPiece | FuturePiece | LofiPiece;
