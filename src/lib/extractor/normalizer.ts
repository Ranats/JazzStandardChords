import { RawSongData } from './parser';

export interface NormalizedSong {
  id: string;
  title: string;
  composer: string;
  key: string;
  timeSignature: string;
  transposeOptions?: TransposeOption[];
  sections: Section[];
}

export interface TransposeOption {
  value: number;
  label: string; // e.g. "Gm（原曲キー）", "Am（Bb楽器用）"
}

export interface Section {
  label: string | null;
  measures: Measure[];
}

export interface Measure {
  number: number;
  chords: Chord[];
  barlineBegin?: string;
  barlineEnd?: string;
  repetition?: string | null;
  volta?: string | null;
  isCoda?: boolean;
  codaNumber?: number;
  forceLineBreak?: boolean;
}

export interface Chord {
  symbol: string;
  beats: number;
  tones: string[];
}

interface ChordData {
  Code: string;
  duration: number;
  tones?: string[];
}

interface RawMeasure {
  section?: string | null;
  volta?: string | number | null;
  beats?: number;
  notes?: string[];
  chords?: ChordData[];
  barline_begin?: string;
  barline_end?: string;
  repetition?: string;
  is_coda?: boolean;
  coda_number?: number;
  force_line_break?: boolean;
}

export function normalizeSong(raw: RawSongData): NormalizedSong {
  const sections: Section[] = [];
  let currentSection: Section | null = null;
  let measureCount = 1;

  const allMeasures = (raw.allNotes as unknown) as RawMeasure[];

  for (const rawMeasure of allMeasures) {
    if (rawMeasure.section && rawMeasure.section.trim()) {
      if (currentSection) {
        sections.push(currentSection);
      }
      currentSection = {
        label: rawMeasure.section.trim(),
        measures: []
      };
    } else if (!currentSection) {
      currentSection = {
        label: null,
        measures: []
      };
    }

    const chords: Chord[] = (rawMeasure.chords || []).map((c) => ({
      symbol: c.Code,
      beats: c.duration,
      tones: c.tones || []
    }));

    currentSection!.measures.push({
      number: measureCount++,
      chords,
      barlineBegin: rawMeasure.barline_begin || 'SINGLE',
      barlineEnd: rawMeasure.barline_end || 'SINGLE',
      repetition: rawMeasure.repetition || null,
      volta: rawMeasure.volta ? String(rawMeasure.volta) : null,
      isCoda: rawMeasure.is_coda || false,
      codaNumber: rawMeasure.coda_number || 0,
      forceLineBreak: rawMeasure.force_line_break || false,
    });
  }

  if (currentSection) {
    sections.push(currentSection);
  }

  return {
    id: raw.id,
    title: raw.title,
    composer: raw.composer,
    key: raw.key || 'C',
    timeSignature: raw.timeSignature || '4/4',
    transposeOptions: raw.transposeOptions || [],
    sections
  };
}
