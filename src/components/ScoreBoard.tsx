'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { NormalizedSong } from '@/lib/extractor/normalizer';
import { Renderer, Stave, StaveNote, Formatter, Annotation, Accidental, Barline, Repetition, Volta } from 'vexflow';

export type Density = 'compact' | 'standard' | 'large';

interface ScoreBoardProps {
  song: NormalizedSong;
  density?: Density;
  zoom?: number;
  onZoomChange?: (newZoom: number) => void;
}

const NOTE_TO_PITCH: Record<string, number> = {
  'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
  'E': 4, 'Fb': 4, 'E#': 5, 'F': 5, 'F#': 6, 'Gb': 6,
  'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10,
  'B': 11, 'Cb': 11, 'B#': 0
};

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
    } else if (pitch <= prevPitch) {
      currentOctave++;
    }
    prevPitch = pitch;
    keys.push(`${tone.toLowerCase()}/` + currentOctave);
  }
  return keys;
}

export default function ScoreBoard({ song, density = 'standard', zoom = 1.0, onZoomChange }: ScoreBoardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const touchState = useRef<{ distance: number; zoomAtStart: number }>({ distance: 0, zoomAtStart: 1.0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) setContainerWidth(entries[0].contentRect.width);
    });
    observer.observe(containerRef.current);
    setContainerWidth(containerRef.current.getBoundingClientRect().width);
    return () => observer.disconnect();
  }, []);

  // Pinch-to-zoom logic
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      );
      touchState.current = { distance: dist, zoomAtStart: zoom };
    }
  }, [zoom]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && onZoomChange) {
      e.preventDefault();
      const dist = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      );
      const ratio = dist / touchState.current.distance;
      const newZoom = Math.max(0.5, Math.min(2.5, touchState.current.zoomAtStart * ratio));
      onZoomChange(newZoom);
    }
  }, [onZoomChange]);

  useEffect(() => {
    if (!containerRef.current || containerWidth === 0) return;
    const div = containerRef.current;
    div.innerHTML = '';

    // Logic for measures per line: Reduce when logical width is tight
    const logicalWidth = containerWidth / zoom;
    let measuresPerLine = 4;
    
    if (logicalWidth < 300) measuresPerLine = 1;
    else if (logicalWidth < 500) measuresPerLine = 2;
    else measuresPerLine = 4;

    const isMobile = containerWidth < 600;
    let paddingX = measuresPerLine === 1 ? 20 : 10;
    if (density === 'compact') paddingX = 2;
    else if (density === 'large' && measuresPerLine > 1) paddingX = 20;

    const measureWidth = (logicalWidth - paddingX * 2) / measuresPerLine;
    const baseMeasureHeight = isMobile ? 150 : 170;
    
    // Scale chord font size: larger when fewer measures per line
    const chordFontSize = measuresPerLine === 1 ? 18 : (measuresPerLine === 2 ? 15 : 13);

    // Flatten measures
    const allMeasures: any[] = [];
    song.sections.forEach(sec => {
      sec.measures.forEach((m, idx) => {
        allMeasures.push({ ...m, label: idx === 0 ? sec.label : null });
      });
    });

    let extraLines = 0;
    allMeasures.forEach((m, i) => {
      if (i > 0 && (m.forceLineBreak || (m.isCoda && m.codaNumber >= 2))) extraLines++;
    });

    const lines = Math.ceil(allMeasures.length / measuresPerLine) + extraLines;
    const logicalTotalHeight = (baseMeasureHeight * lines) + 140; 

    const renderer = new Renderer(div, Renderer.Backends.SVG);
    renderer.resize(containerWidth, logicalTotalHeight * zoom);
    const context = renderer.getContext();
    context.setFillStyle('currentColor');
    context.setStrokeStyle('currentColor');
    context.scale(zoom, zoom);

    let currentX = paddingX;
    let currentY = 120;
    let measuresOnThisLine = 0;

    allMeasures.forEach((measure, i) => {
      const isFirst = (i === 0);
      const shouldBreak = !isFirst && (
        (measure.isCoda && measure.codaNumber >= 2) ||
        measure.forceLineBreak ||
        measuresOnThisLine >= measuresPerLine
      );

      if (shouldBreak) {
        currentX = paddingX;
        currentY += baseMeasureHeight;
        measuresOnThisLine = 0;
      }

      const stave = new Stave(currentX, currentY, measureWidth);
      if (isFirst) {
        // Reduced glyph scale for clef/timeSig isn't directly exposed easily,
        // but adding more padding for the first measure helps the first chord.
        stave.addClef('treble').addTimeSignature(song.timeSignature || '4/4');
        // Add internal padding to first measure to avoid overlap with clef
        stave.setNoteStartX(stave.getNoteStartX() + 15);
      }

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

      const repTypeMap: Record<string, number> = {
        'CODA_LEFT': Repetition.type.CODA_LEFT, 'CODA_RIGHT': Repetition.type.CODA_RIGHT,
        'SEGNO_LEFT': Repetition.type.SEGNO_LEFT, 'SEGNO_RIGHT': Repetition.type.SEGNO_RIGHT,
        'DC': Repetition.type.DC, 'DS': Repetition.type.DS, 'FINE': Repetition.type.FINE,
        'DC_AL_CODA': Repetition.type.DC_AL_CODA, 'DS_AL_CODA': Repetition.type.DS_AL_CODA,
      };
      if (measure.repetition && repTypeMap[measure.repetition] !== undefined) {
        stave.setRepetitionType(repTypeMap[measure.repetition], 0);
      }

      if (measure.volta) {
        const voltaNum = Number(measure.volta);
        const nextVolta = allMeasures[i + 1]?.volta ? Number(allMeasures[i + 1].volta) : 0;
        const prevVolta = i > 0 ? Number(allMeasures[i - 1]?.volta || 0) : 0;
        const voltaType = nextVolta === voltaNum ? (prevVolta === voltaNum ? Volta.type.MID : Volta.type.BEGIN) : (prevVolta === voltaNum ? Volta.type.MID : Volta.type.BEGIN);
        // y_shift = 15 to bring it closer to staff/measure numbers
        stave.setVoltaType(voltaType, `${voltaNum}.`, 15);
      }

      stave.setContext(context).draw();

      // Section Label & Measure Number
      const lSize = 13;
      const lPadX = 8;
      const lPadY = 5;
      const lx = currentX + 5;
      
      // Position for Label (Higher up)
      const lyLabel = stave.getYForTopText(1.5);
      // Position for Measure Number (Original, close to staff)
      const lyMeasure = stave.getYForTopText(0) + 2;
      
      if (measure.label) {
        context.save();
        const labelText = String(measure.label);
        const boxW = lSize + lPadX * 2;
        const boxH = lSize + lPadY * 2;
        const boxX = lx - lPadX;
        const boxY = lyLabel - lSize - lPadY - 5;
        
        context.beginPath();
        context.setLineWidth(1.2);
        context.setStrokeStyle('currentColor');
        context.setFillStyle('transparent'); // Ensure no fill
        context.rect(boxX, boxY, boxW, boxH);
        context.stroke();
        
        context.setFont('Arial', lSize, 'bold');
        context.fillText(labelText, lx, lyLabel - lPadY - 4);
        context.restore();
      }

      // Measure number: placed directly above the staff
      context.save();
      context.setFont('Arial', 10, 'normal');
      context.setFillStyle('#888888');
      context.fillText(String(measure.number), currentX + 3, lyMeasure);
      context.restore();

      const notesToDraw: any[] = [];
      measure.chords.forEach((chord: any) => {
        const keys = buildKeys(chord.tones);
        if (keys.length === 0) {
          notesToDraw.push(new StaveNote({ keys: ['b/4'], duration: chord.beats === 4 ? 'wr' : (chord.beats === 2 ? 'hr' : 'qr') }));
          return;
        }
        const staveNote = new StaveNote({ keys, duration: chord.beats === 4 ? 'w' : (chord.beats === 2 ? 'h' : 'q') });
        chord.tones.forEach((tone: string, idx: number) => {
          if (tone.includes('#')) staveNote.addModifier(new Accidental('#'), idx);
          else if (tone.length > 1 && tone.includes('b') && tone !== 'B') staveNote.addModifier(new Accidental('b'), idx);
        });
        staveNote.addModifier(new Annotation(chord.symbol).setFont('Arial', chordFontSize, 'bold').setVerticalJustification(Annotation.VerticalJustify.BOTTOM), 0);
        notesToDraw.push(staveNote);
      });

      if (notesToDraw.length > 0) Formatter.FormatAndDraw(context, stave, notesToDraw);

      currentX += measureWidth;
      measuresOnThisLine++;
    });

    const svg = div.querySelector('svg');
    if (svg) {
      svg.style.width = '100%';
      svg.style.height = 'auto';
      svg.style.display = 'block';
      svg.style.color = 'var(--foreground)';
    }
  }, [song, containerWidth, density, zoom]);

  return (
    <div className="w-full relative touch-none" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove}>
      <div ref={containerRef} className="vexflow-svg w-full text-zinc-900 dark:text-zinc-100 overflow-hidden" />
    </div>
  );
}
