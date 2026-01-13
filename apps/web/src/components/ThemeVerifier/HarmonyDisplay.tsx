import React from 'react';

interface HarmonyDisplayProps {
  system: any;
  activeColorName: string;
}

export const HarmonyDisplay: React.FC<HarmonyDisplayProps> = ({ system, activeColorName }) => {
  const harmonies = system.generateHarmonies(activeColorName);

  const Swatch = ({ c, label }: { c: string, label: string }) => (
      <div className="harmony-swatch-wrapper">
          <div className="harmony-swatch-circle" style={{ background: c }} />
          <span className="harmony-swatch-label">{label}</span>
          <code className="harmony-swatch-code">{c}</code>
      </div>
  );

  return (
      <div className="harmony-container">
          {/* Compl */}
          <div className="harmony-group">
              <h4 className="harmony-group-title">互补色</h4>
              <Swatch c={harmonies.complementary} label="180°" />
          </div>
          
          {/* Analogous */}
          <div className="harmony-group">
              <h4 className="harmony-group-title">邻近色</h4>
              <div style={{ display: 'flex', gap: '16px' }}>
                  <Swatch c={harmonies.analogous[0]} label="-30°" />
                  <Swatch c={harmonies.analogous[1]} label="+30°" />
              </div>
          </div>
          
          {/* Triadic */}
          <div className="harmony-group">
              <h4 className="harmony-group-title">三元色</h4>
              <div style={{ display: 'flex', gap: '16px' }}>
                  <Swatch c={harmonies.triadic[0]} label="-120°" />
                  <Swatch c={harmonies.triadic[1]} label="+120°" />
              </div>
          </div>
      </div>
  );
};
