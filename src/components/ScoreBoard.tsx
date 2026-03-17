'use client';

import React, { useEffect, useRef, useState } from 'react';
import { NormalizedSong } from '@/lib/extractor/normalizer';
import { Renderer, Stave, StaveNote, Formatter, Annotation, Accidental, Barline, Repetition, Volta } from 'vexflow';

export type Density = 'compact' | 'standard' | 'large';

interface ScoreBoardProps {
  song: NormalizedSong;
  density?: Density;
  zoom?: number;
}

// Map note name to MIDI-like pitch number for octave assignment
const NOTE_TO_PITCH: Record<string, number> = {
  'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
  'E': 4, 'Fb': 4, 'E#': 5, 'F': 5, 'F#': 6, 'Gb': 6,
  'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10,
  'B': 11, 'Cb': 11, 'B#': 0
};

/**
 * Build VexFlow keys ensuring root-position voicing:
 * First tone is lowest, each subsequent tone is placed higher.
 */
function buildKeys(tones: string[]): string[] {
  if (tones.length === 0) return [];
  
  const BASE_OCTAVE = 4;
  const keys: string[] = [];
  let currentOctave = BASE_OCTAVE;
  let prevPitch = -1;

  for (let i = 0; i < tones.length; i++) {
    const tone = tones[i];
    const pitch = NOTE_TO_PITCH[tone];
    if (pitch === undefined) {
      keys.push(`${tone.toLowerCase()}/4`);
      continue;
    }

    if (i === 0) {
      currentOctave = BASE_OCTAVE;
    } else {
      // If current pitch <= previous, bump octave
      if (pitch <= prevPitch) {
        currentOctave++;
      }
    }
    prevPitch = pitch;
    keys.push(`${tone.toLowerCase()}/` + currentOctave);
  }
  return keys;
}

export default function ScoreBoard({ song, density = 'standard', zoom = 1.0 }: ScoreBoardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) setContainerWidth(entries[0].contentRect.width);
    });
    observer.observe(containerRef.current);
    setContainerWidth(containerRef.current.getBoundingClientRect().width);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!containerRef.current || containerWidth === 0) return;
    const div = containerRef.current;
    div.innerHTML = '';

    const isMobile = containerWidth < 600;
    let paddingX = 10;
    if (density === 'compact') paddingX = 2;
    else if (density === 'large') paddingX = 20;

    const measuresPerLine = 4;
    // Ensure a minimum width per measure to avoid chord overlap
    const minMeasureWidth = 200;
    const measureWidth = Math.max(minMeasureWidth, (containerWidth - paddingX * 2) / measuresPerLine);
    const measureHeight = isMobile ? 150 * zoom : 170 * zoom;

    // Flatten measures preserving metadata
    const allMeasures: any[] = [];
    song.sections.forEach(sec => {
      sec.measures.forEach((m, idx) => {
        allMeasures.push({
          ...m,
          label: idx === 0 ? sec.label : null
        });
      });
    });

    // Calculate extra lines for coda/force_line_break
    let extraLines = 0;
    allMeasures.forEach((m, i) => {
      if (i > 0 && (m.forceLineBreak || (m.isCoda && m.codaNumber >= 2))) {
        extraLines++;
      }
    });

    const lines = Math.ceil(allMeasures.length / measuresPerLine) + extraLines;
    const totalHeight = (measureHeight * lines) + 140 * zoom; 

    const renderer = new Renderer(div, Renderer.Backends.SVG);
    const svgWidth = (measureWidth * measuresPerLine + paddingX * 2) * zoom;
    renderer.resize(svgWidth, totalHeight);
    const context = renderer.getContext();
    context.setFillStyle('currentColor');
    context.setStrokeStyle('currentColor');
    context.scale(zoom, zoom);

    let currentX = paddingX;
    let currentY = 140; // Top space: section-label box (~25px) + measure-number (~15px) + volta + staff
    let measuresOnThisLine = 0;

    allMeasures.forEach((measure, i) => {
      const isFirst = (i === 0);

      // Line break logic
      const shouldBreak = !isFirst && (
        (measure.isCoda && measure.codaNumber >= 2) ||
        measure.forceLineBreak ||
        measuresOnThisLine >= measuresPerLine
      );

      if (shouldBreak) {
        currentX = paddingX;
        currentY += measureHeight;
        measuresOnThisLine = 0;
      }

      const stave = new Stave(currentX, currentY, measureWidth);

      // Clef & time sig on first measure only
      if (isFirst) {
        stave.addClef('treble').addTimeSignature(song.timeSignature || '4/4');
      }

      // Section label — drawn manually ABOVE the staff (after stave is positioned)
      // We draw this after stave.draw() so we can use raw context coords

      // ===== Barlines from data =====
      switch (measure.barlineBegin) {
        case 'REPEAT_BEGIN': stave.setBegBarType(Barline.type.REPEAT_BEGIN); break;
        case 'DOUBLE': stave.setBegBarType(Barline.type.DOUBLE); break;
        case 'FINAL': stave.setBegBarType(Barline.type.END); break;
        default: stave.setBegBarType(Barline.type.SINGLE); break;
      }
      switch (measure.barlineEnd) {
        case 'REPEAT_END': stave.setEndBarType(Barline.type.REPEAT_END); break;
        case 'DOUBLE': stave.setEndBarType(Barline.type.DOUBLE); break;
        case 'FINAL': stave.setEndBarType(Barline.type.END); break;
        default: stave.setEndBarType(Barline.type.SINGLE); break;
      }

      // ===== Repetition signs (D.C., D.S., Coda, Segno, Fine) =====
      const repTypeMap: Record<string, number> = {
        'CODA_LEFT': Repetition.type.CODA_LEFT,
        'CODA_RIGHT': Repetition.type.CODA_RIGHT,
        'SEGNO_LEFT': Repetition.type.SEGNO_LEFT,
        'SEGNO_RIGHT': Repetition.type.SEGNO_RIGHT,
        'DC': Repetition.type.DC,
        'DS': Repetition.type.DS,
        'FINE': Repetition.type.FINE,
        'DC_AL_CODA': Repetition.type.DC_AL_CODA,
        'DS_AL_CODA': Repetition.type.DS_AL_CODA,
      };
      if (measure.repetition && repTypeMap[measure.repetition] !== undefined) {
        stave.setRepetitionType(repTypeMap[measure.repetition], 0);
      }

      // ===== Volta brackets (1st/2nd endings) =====
      if (measure.volta) {
        const voltaNum = Number(measure.volta);
        const nextMeasure = allMeasures[i + 1];
        const nextVolta = nextMeasure?.volta ? Number(nextMeasure.volta) : 0;
        
        let voltaType: number;
        if (nextVolta === voltaNum) {
          // More measures in this volta
          const prevMeasure = i > 0 ? allMeasures[i - 1] : null;
          const prevVolta = prevMeasure?.volta ? Number(prevMeasure.volta) : 0;
          voltaType = prevVolta === voltaNum ? Volta.type.MID : Volta.type.BEGIN;
        } else {
          // Last measure of this volta bracket — use MID or BEGIN to avoid right vertical bar
          const prevMeasure = i > 0 ? allMeasures[i - 1] : null;
          const prevVolta = prevMeasure?.volta ? Number(prevMeasure.volta) : 0;
          voltaType = prevVolta === voltaNum ? Volta.type.MID : Volta.type.BEGIN;
        }
        // yShift=0 places Volta at VexFlow's default position: directly above the top staff line
        // This is the correct position (above the staff, not inside it)
        stave.setVoltaType(voltaType, `${voltaNum}.`, 0);
      }

      stave.setContext(context).draw();

      // ===== Section label + measure number — draw after staff =====
      // Calculate label box geometry first so measure number can be placed below it
      const lSize = 13;
      const lPadX = 8;
      const lPadY = 5;
      const lx = currentX + 5;
      const ly = stave.getYForTopText(4); // Highest position
      const boxH = lSize + lPadY * 2;
      const labelBottomY = (ly - lSize - lPadY + boxH) * zoom; // SVG bottom edge of box

      if (measure.label) {
        const labelText = String(measure.label);
        // Draw the box border by appending an SVG rect directly to the SVG root
        const svgEl = div.querySelector('svg');
        if (svgEl) {
          const boxW = lSize + lPadX * 2;
          const boxX = lx - lPadX;
          const boxY = ly - lSize - lPadY;
          const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          rect.setAttribute('x', String(boxX * zoom));
          rect.setAttribute('y', String(boxY * zoom));
          rect.setAttribute('width', String(boxW * zoom));
          rect.setAttribute('height', String(boxH * zoom));
          rect.setAttribute('fill', 'none');
          rect.setAttribute('stroke', 'currentColor');
          rect.setAttribute('stroke-width', '1.2');
          rect.setAttribute('class', 'section-label-box');
          svgEl.appendChild(rect);
        }
        // Draw label text
        context.save();
        context.setFont('Arial', lSize, 'bold');
        context.setFillStyle('currentColor');
        context.fillText(labelText, lx, ly - lPadY + 1);
        context.restore();
      }

      // ===== Measure number — placed below label box with 6px margin =====
      context.save();
      context.setFont('Arial', 10, 'normal');
      context.setFillStyle('#888888');
      // Y in unscaled coords: labelBottomY is in SVG px, divide by zoom for VexFlow coords
      const mnUnscaledY = (labelBottomY / zoom) + 6 + 10; // box bottom + 6px gap + font size
      context.fillText(String(measure.number), currentX + 3, mnUnscaledY);
      context.restore();

      // ===== Build notes =====
      const notesToDraw: any[] = [];
      measure.chords.forEach((chord: any) => {
        const keys = buildKeys(chord.tones);

        if (keys.length === 0) {
          const rest = new StaveNote({
            keys: ['b/4'],
            duration: chord.beats === 4 ? 'wr' : (chord.beats === 2 ? 'hr' : 'qr')
          });
          notesToDraw.push(rest);
          return;
        }

        const staveNote = new StaveNote({
          keys,
          duration: chord.beats === 4 ? 'w' : (chord.beats === 2 ? 'h' : 'q')
        });

        // Add accidentals
        chord.tones.forEach((tone: string, idx: number) => {
          if (tone.includes('#')) {
            staveNote.addModifier(new Accidental('#'), idx);
          } else if (tone.includes('b') && tone !== 'B') {
            // Avoid marking 'B' as a flat accidentally
            const hasFlat = tone.length > 1 && tone.includes('b');
            if (hasFlat) staveNote.addModifier(new Accidental('b'), idx);
          }
        });

        // ===== Chord symbol BELOW the staff =====
        staveNote.addModifier(
          new Annotation(chord.symbol)
            .setFont('Arial', isMobile ? 12 : 14, 'bold')
            .setVerticalJustification(Annotation.VerticalJustify.BOTTOM),
          0
        );

        notesToDraw.push(staveNote);
      });

      if (notesToDraw.length > 0) {
        Formatter.FormatAndDraw(context, stave, notesToDraw);
      }

      currentX += measureWidth;
      measuresOnThisLine++;
    });

    // SVG responsive
    const svg = div.querySelector('svg');
    if (svg) {
      if (zoom === 1.0) {
        svg.style.width = '100%';
        svg.style.height = 'auto';
      } else {
        svg.style.width = `${containerWidth * zoom}px`;
        svg.style.height = 'auto';
        div.style.overflowX = 'auto';
      }
      svg.style.color = 'var(--foreground)';
    }
  }, [song, containerWidth, density, zoom]);

  return (
    <div className="w-full relative">
      <div
        ref={containerRef}
        className="vexflow-svg w-full text-zinc-900 dark:text-zinc-100 overflow-x-auto overflow-y-hidden"
      />
    </div>
  );
}
