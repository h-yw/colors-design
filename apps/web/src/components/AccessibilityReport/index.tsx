import React from 'react';
import { calcAPCA } from '@moonhou/colors-core';
import { wcagContrast } from 'culori';
import type { TraditionalColorSystem } from '@moonhou/colors-core';
import { APCAIndicator } from './APCAIndicator';

interface AccessibilityReportProps {
  palette: any;
  system: TraditionalColorSystem;
}

export const AccessibilityReport: React.FC<AccessibilityReportProps> = ({ palette }) => {
  const bg = palette.tokens['bg.canvas'];
  const text = palette.tokens['text.primary'];
  const brand = palette.tokens['brand.primary'];
  
  // WCAG
  const wcagScore = wcagContrast(text, bg);
  
  // APCA
  const apcaScore = calcAPCA(text, bg);
  
  // APCA
  const brandOnBgWCAG = wcagContrast(brand, bg);
  const brandOnBgAPCA = calcAPCA(brand, bg);

  return (
    <section className="docs-section">
      <h2>Accessibility Analysis (WCAG vs APCA)</h2>
      <div className="a11y-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Card 1: Text on Canvas */}
        <div style={{ background: bg, color: text, padding: '24px', borderRadius: '12px', border: '1px solid var(--sys-border-default)' }}>
          <h3 style={{ marginTop: 0 }}>Body Text Reading</h3>
          <div style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>
             Ag
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px 16px', fontSize: '14px' }}>
             <strong>WCAG Ratio:</strong> <span>{wcagScore.toFixed(2)} : 1</span>
             <strong>APCA (Lc):</strong> <span><APCAIndicator score={apcaScore} /></span>
          </div>
        </div>

        {/* Card 2: Brand on Canvas */}
        <div style={{ background: bg, color: brand, padding: '24px', borderRadius: '12px', border: '1px solid var(--sys-border-default)' }}>
          <h3 style={{ marginTop: 0, color: text }}>Brand Check</h3>
          <div style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>
             Br
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px 16px', fontSize: '14px', color: text }}>
             <strong>WCAG Ratio:</strong> <span>{brandOnBgWCAG.toFixed(2)} : 1</span>
             <strong>APCA (Lc):</strong> <span><APCAIndicator score={brandOnBgAPCA} /></span>
          </div>
        </div>
      </div>
    </section>
  );
};
