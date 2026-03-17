// Standard Jazz Chord Tone Mappings
const ROOT_NOTES: Record<string, number> = {
  'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
  'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8,
  'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
};

const NOTE_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

interface Quality {
  intervals: number[]; // relative to root (0)
}

const QUALITIES: Record<string, number[]> = {
  'maj7': [0, 4, 7, 11],
  'maj': [0, 4, 7, 11], // default to maj7 in jazz context
  'm7': [0, 3, 7, 10],
  'm': [0, 3, 7, 10], 
  '7': [0, 4, 7, 10],
  'm7b5': [0, 3, 6, 10],
  'dim7': [0, 3, 6, 9],
  'dim': [0, 3, 6, 9],
  'aug7': [0, 4, 8, 10],
  'aug': [0, 4, 8, 10],
  '6': [0, 4, 7, 9],
  'm6': [0, 3, 7, 9],
  'maj9': [0, 4, 7, 11, 14],
  'm9': [0, 3, 7, 10, 14],
  '9': [0, 4, 7, 10, 14],
};

export function getTones(chordSymbol: string): string[] {
  if (!chordSymbol) return [];

  // 1. Identify Root (e.g., C, C#, Bb)
  let root = '';
  if (chordSymbol[1] === '#' || chordSymbol[1] === 'b') {
    root = chordSymbol.substring(0, 2);
  } else {
    root = chordSymbol[0];
  }

  const rootPitch = ROOT_NOTES[root];
  if (rootPitch === undefined) return [];

  // 2. Identify Quality
  const rest = chordSymbol.substring(root.length);
  let intervals = QUALITIES['7']; // default

  // Simple matching for common jazz qualities
  if (rest.startsWith('maj7') || rest.startsWith('M7') || rest.startsWith('△7')) {
    intervals = QUALITIES['maj7'];
  } else if (rest.startsWith('m7b5') || rest.startsWith('ø')) {
    intervals = QUALITIES['m7b5'];
  } else if (rest.startsWith('m7') || rest.startsWith('-7')) {
    intervals = QUALITIES['m7'];
  } else if (rest.startsWith('dim7') || rest.startsWith('o7')) {
    intervals = QUALITIES['dim7'];
  } else if (rest.startsWith('7')) {
    intervals = QUALITIES['7'];
  } else if (rest.startsWith('m6') || rest.startsWith('-6')) {
    intervals = QUALITIES['m6'];
  } else if (rest.startsWith('6')) {
    intervals = QUALITIES['6'];
  } else if (rest.startsWith('m') || rest.startsWith('-')) {
    intervals = QUALITIES['m7'];
  }

  // 3. Convert intervals to note names
  return intervals.map(interval => {
    const pitch = (rootPitch + interval) % 12;
    return NOTE_NAMES[pitch];
  });
}
