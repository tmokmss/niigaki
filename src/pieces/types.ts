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
  // the chord an octave up as a sixteenth-note glockenspiel ripple
  sparkle?: boolean;
  // pitched-up formant "vocal" chops on the chord's top notes
  chop?: boolean;
};

export type FuturePiece = {
  kind: "future";
  slug: string;
  title: string;
  description: string;
  bpm: number;
  // kawaii: music-box lead, swung sixteenth hats with toy clicks, lighter pumping, a bell on each crash and a glide under the riser
  style?: "kawaii";
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

// c: chord with its 7th/9th, root A3-G4 first; c2: chord for beats 3-4; m: [note, sixteenths]
// beat: two-step drums with ghost notes and shuffled hats; hat: the hats alone; open: pad low-pass 0-1, reached by the end of the bar
export type DnbBar = {
  c: string[];
  c2?: string[];
  m?: [string, number][];
  beat?: boolean;
  hat?: boolean;
  bass?: boolean;
  roll?: 4 | 8 | 16;
  open?: number;
  crash?: boolean;
};

export type DnbPiece = {
  kind: "dnb";
  slug: string;
  title: string;
  description: string;
  bpm: number;
  visual?: "danmaku";
  hues?: number[];
  bars: DnbBar[];
};

// c: chord with its add9/7th, root A3-G4 first; c2: chord for beats 3-4; m: [note, sixteenths]
// the supersaw pad and the piano always hold the chord; open: pad low-pass 0-1, reached by the end of the bar
// saw: a supersaw lead doubles the piano melody; wobble: wobble bass over a sine sub, its low-pass opening this many times a bar
// beat: half-time drums with the snare on beat 3; hat: the hats alone; riser: a rising synth sweep across consecutive bars; gap: beat 4 falls silent
export type DubstepBar = {
  c: string[];
  c2?: string[];
  m?: [string, number][];
  open?: number;
  // supersaw lead over the piano, 0-1
  saw?: number;
  wobble?: 4 | 8 | 12;
  beat?: boolean;
  hat?: boolean;
  roll?: 4 | 8 | 16 | 32;
  riser?: boolean;
  gap?: boolean;
  crash?: boolean;
};

export type DubstepPiece = {
  kind: "dubstep";
  slug: string;
  title: string;
  description: string;
  bpm: number;
  visual?: "danmaku";
  hues?: number[];
  bars: DubstepBar[];
};

// c: the root for the guitarist's thumb (E2-Eb3), then three or four notes for the fingers (G3-C5); c2: chord for beats 3-4; m: [note, sixteenths]
// the nylon guitar always plays: the thumb on 1 and 3, the fingers pinching the rest of the chord on 1, 2 and the and of 3
// beat: eighth-note shaker, cross-stick on the bossa clave and a soft kick; bass: doubles the thumb with pickups into the next chord
export type BossaBar = {
  c: string[];
  c2?: string[];
  m?: [string, number][];
  // the fingers pick the chord one string at a time instead
  arp?: boolean;
  beat?: boolean;
  bass?: boolean;
  crash?: boolean;
};

export type BossaPiece = {
  kind: "bossa";
  slug: string;
  title: string;
  description: string;
  bpm: number;
  visual?: "danmaku";
  hues?: number[];
  bars: BossaBar[];
};

// c: chord with its 7th/9th, root A3-G4 first; c2: chord for beats 3-4; m: [note, sixteenths]
// the chorused saw pad always holds the chord; open: pad and arp low-pass 0-1, reached by the end of the bar
// beat: kick on 1 and 3 under a gated-reverb snare on 2 and 4, with sixteenth hats; hat: the hats alone
// bass: sixteenths jumping between the root and its octave, ducked under the kick; arp: the chord in sixteenth-note plucks
// fill: toms rolling down across beats 3-4; sax: the lead turns from the saw to a breathy FM sax
export type SynthwaveBar = {
  c: string[];
  c2?: string[];
  m?: [string, number][];
  open?: number;
  beat?: boolean;
  hat?: boolean;
  bass?: boolean;
  arp?: boolean;
  fill?: boolean;
  sax?: boolean;
  crash?: boolean;
};

export type SynthwavePiece = {
  kind: "synthwave";
  slug: string;
  title: string;
  description: string;
  bpm: number;
  visual?: "danmaku";
  hues?: number[];
  bars: SynthwaveBar[];
};

export type Piece = PianoPiece | ChipPiece | FuturePiece | LofiPiece | DnbPiece | DubstepPiece | BossaPiece | SynthwavePiece;
