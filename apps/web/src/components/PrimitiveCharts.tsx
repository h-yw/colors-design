
import React, { useMemo } from 'react';
import { converter } from 'culori';
import { useThemeStore } from '../store/useThemeStore';
import { TraditionalColorSystem } from '@moonhou/colors-core';
import colorData from '../lib/colors.json';

const toOklch = converter('oklch');

// --- Interfaces ---

interface DataPoint {
  level: number;
  val: number;
}

interface SimpleLineChartProps {
  data: DataPoint[];
  color: string;
  title: string;
  yDomain?: [number, number];
  height?: number;
}

// Simple SVG Line Chart Component
const SimpleLineChart: React.FC<SimpleLineChartProps> = ({ data, color, title, yDomain = [0, 100], height = 150 }) => {
  const width = 300;
  const padding = 20;

  // Scales
  const mapX = (x: number) => padding + (x / 100) * (width - 2 * padding);
  const mapY = (y: number) => height - padding - ((y - yDomain[0]) / (yDomain[1] - yDomain[0])) * (height - 2 * padding);

  // Generate Path
  let pathD = `M ${mapX(data[0].level)} ${mapY(data[0].val)}`;
  data.forEach((p, i) => {
    if (i > 0) pathD += ` L ${mapX(p.level)} ${mapY(p.val)}`;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ fontSize: '12px', marginBottom: '8px', fontWeight: 'bold', color: 'var(--sys-text-secondary)' }}>{title}</div>
      <svg width={width} height={height} style={{ overflow: 'visible', background: 'var(--sys-bg-container)', borderRadius: '8px', border: '1px solid var(--sys-border-divider)' }}>
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map(lvl => (
          <line key={lvl} x1={mapX(lvl)} y1={padding} x2={mapX(lvl)} y2={height - padding} stroke="var(--sys-border-divider)" strokeDasharray="2,2" />
        ))}
        {/* Axis */}
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="var(--sys-border-default)" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="var(--sys-border-default)" />

        {/* The Line */}
        <path d={pathD} fill="none" stroke={color} strokeWidth="2" />

        {/* Points */}
        {data.map((p) => (
          <circle key={p.level} cx={mapX(p.level)} cy={mapY(p.val)} r="3" fill={color} />
        ))}
      </svg>
    </div>
  );
};

interface PrimitiveChartsProps {
    primitives?: { [key: string]: { [level: string]: string } };
}

interface ColorItem {
    name: string;
    hex: string;
    pinyin: string;
}

export const PrimitiveCharts: React.FC<PrimitiveChartsProps> = ({ primitives: initialPrimitives }) => {
  const { theme, hex, gamut, mode } = useThemeStore();

  // If we have access to the store, rely on it to generate the "Live" primitives
  // Fallback to initialPrimitives if store is not yet hydrated or something?
  // Actually, for "Principles" page, we want it to react to the Global Theme.
  
  const livePrimitives = useMemo(() => {
     try {
         let activeColor: ColorItem | undefined;
         if (hex) {
             const h = hex.startsWith('#') ? hex : `#${hex}`;
             activeColor = { name: 'Custom', hex: h, pinyin: 'Custom' };
         } else if (theme) {
             activeColor = (colorData as ColorItem[]).find(c => c.name === theme);
         }

         if (!activeColor) return initialPrimitives; // Fallback

         const system = new TraditionalColorSystem(
            activeColor.name === 'Custom' ? [activeColor] : colorData as ColorItem[], 
            { targetGamut: gamut }
         );
         // Generate primitives (raw tonal palettes)
         // generatePalette returns { primitives, tokens, state, meta }
         // We just need the raw primitives.
         // Note: TraditionalColorSystem.generatePalette returns object with primitives as strings inside.
         // Let's use the palette.primitives object.
         const pal = system.generatePalette(activeColor.name, mode === 'dark');
         return pal.primitives; 

     } catch (e) {
         console.error(e);
         return initialPrimitives;
     }
  }, [theme, hex, gamut, mode, initialPrimitives]);

  const activePrimitives = livePrimitives || initialPrimitives;

  if (!activePrimitives) return null;

  return (
    <section className="docs-section">
      <h2>Primitives (Tonal Palettes)</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {Object.entries(activePrimitives).map(([name, scale]) => {
          // Prepare data for charts
          const levels = Object.keys(scale).map(Number).sort((a, b) => a - b);
          const lightnessData = levels.map(l => {
            const c = toOklch(scale[l]);
            // @ts-ignore
            return { level: l, val: c ? c.l * 100 : 0 };
          });
          const chromaData = levels.map(l => {
            const c = toOklch(scale[l]);
            // @ts-ignore
            return { level: l, val: c ? c.c * 100 : 0 }; // Scale chroma 0-0.4 typical to 0-40 usually, or just x100 for display
          });

          return (
            <div key={name}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold', textTransform: 'capitalize', color: 'var(--sys-text-primary)' }}>
                  {name} Scale
                </div>
              </div>

              {/* Visual Color Ramp */}
              <div className="color-ramp" style={{ marginBottom: '16px' }}>
                {Object.entries(scale).map(([level, hex]) => (
                  <div key={level} className="ramp-swatch" style={{ backgroundColor: hex as string, color: parseInt(level) > 50 ? '#000' : '#fff' }}>
                    {level}
                  </div>
                ))}
              </div>

              {/* Charts Row */}
              <div style={{ display: 'flex', gap: '24px', padding: '16px', background: 'var(--sys-bg-elevated)', borderRadius: '12px' }}>
                <SimpleLineChart data={lightnessData} color="var(--sys-brand-primary)" title="Lightness (L)" yDomain={[0, 100]} />
                <SimpleLineChart data={chromaData} color="var(--sys-error-text)" title="Chroma (C x100)" yDomain={[0, 40]} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', fontSize: '12px', color: 'var(--sys-text-secondary)', gap: '8px' }}>
                  <p><strong>Lightness:</strong> Should be linear (0-100). This ensures predictable contrast ratios.</p>
                  <p><strong>Chroma:</strong> Typically an arc. Low at extremes (White/Black), peaking in validity range.</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  );
};
