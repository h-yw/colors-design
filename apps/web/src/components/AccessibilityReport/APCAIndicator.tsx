import React from 'react';
import { getContrastRating } from '@moonhou/colors-core';

interface APCAIndicatorProps {
  score: number;
}

export const APCAIndicator: React.FC<APCAIndicatorProps> = ({ score }) => {
  const rating = getContrastRating(score);
  const absScore = Math.abs(score);
  
  let color = 'var(--sys-neutral-40)';
  if (absScore >= 90) color = 'var(--sys-success-text)';
  else if (absScore >= 75) color = 'var(--sys-success-text)';
  else if (absScore >= 60) color = 'var(--sys-warning-text)';
  else if (absScore >= 45) color = 'var(--sys-warning-text)';
  else color = 'var(--sys-error-text)';

  const badgeStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '2px 8px',
    borderRadius: '12px',
    background: 'var(--sys-bg-container)', // Simplified, or use semantic bg
    border: `1px solid ${color}`,
    fontSize: '11px',
    fontWeight: 600,
    color: color,
  };

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
      <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>Lc {score.toFixed(1)}</span>
      <span style={badgeStyle}>
        {rating}
      </span>
    </div>
  );
};
