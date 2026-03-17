import { NormalizedSong, Chord } from '../extractor/normalizer';

const PITCH_CLASSES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

// Map theoretical sharp/flat equivalents to our standard 12-tone array
const NOTE_TO_INDEX: Record<string, number> = {
  'B#': 0, 'C': 0,
  'C#': 1, 'Db': 1,
  'D': 2,
  'D#': 3, 'Eb': 3,
  'E': 4, 'Fb': 4,
  'E#': 5, 'F': 5,
  'F#': 6, 'Gb': 6,
  'G': 7,
  'G#': 8, 'Ab': 8,
  'A': 9,
  'A#': 10, 'Bb': 10,
  'B': 11, 'Cb': 11
};

export function transposeNote(note: string, semitones: number): string {
  // Extract base note and any accidentals
  // Sometimes scraped notes might have multiple # or b, e.g. C##, Ebb
  // Standard format from site is usually basic # or b, e.g. C, C#, Db
  
  // Replace HTML entity if present, though parser should handle it
  const cleanNote = note.replace(/&#35;/g, '#');
  
  const index = NOTE_TO_INDEX[cleanNote];
  if (index === undefined) {
    // If it's a deeply complex accidental or unknown, just return it
    return note;
  }
  
  // Calculate new index
  // Add 12 to handle negative modulo correctly in JS
  const newIndex = (index + semitones % 12 + 12) % 12;
  return PITCH_CLASSES[newIndex];
}

export function transposeChord(chord: Chord, semitones: number): Chord {
  // A chord symbol usually starts with a root note, e.g. "Cmaj7", "F#m7", "Bb7"
  // We need to parse the root note from the rest of the symbol
  const symbolMatch = chord.symbol.match(/^([A-G][#b]?)(.*)$/);
  
  let newSymbol = chord.symbol;
  if (symbolMatch) {
    const root = symbolMatch[1];
    const quality = symbolMatch[2];
    const newRoot = transposeNote(root, semitones);
    newSymbol = `${newRoot}${quality}`;
  }

  // Transpose the individual tones
  const newTones = chord.tones.map(t => transposeNote(t, semitones));

  return {
    ...chord,
    symbol: newSymbol,
    tones: newTones
  };
}

export function transposeSong(song: NormalizedSong, semitones: number): NormalizedSong {
  if (semitones === 0) return song;

  // Attempt to transpose the track's stated key (just the root letter part)
  const keyMatch = song.key.match(/^([A-G][#b]?)(.*)$/);
  let newKey = song.key;
  if (keyMatch) {
    const root = keyMatch[1];
    const quality = keyMatch[2];
    newKey = `${transposeNote(root, semitones)}${quality}`;
  }

  const newSections = song.sections.map(sec => ({
    ...sec,
    measures: sec.measures.map(m => ({
      ...m,
      chords: m.chords.map(c => transposeChord(c, semitones))
    }))
  }));

  return {
    ...song,
    key: newKey,
    sections: newSections
  };
}
