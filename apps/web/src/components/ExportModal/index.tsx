import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { TraditionalColorSystem } from '@moonhou/colors-core';
import { formatCss } from 'culori';
import { mapToFigma, HarmonyMapper } from '@moonhou/colors-core';
import { useActivePalette } from '../../hooks/useActivePalette';

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    // Removed props as we now use hook
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const { palette, system, activeColor, isDark } = useActivePalette();
  const selectedName = activeColor.name; // Logic from hook
  
  const [exportTab, setExportTab] = useState<'css' | 'json_light' | 'json_dark' | 'figma' | 'harmony_light' | 'harmony_dark'>('css');
  const [cssPrefix, setCssPrefix] = useState<string>('sys');
  const [useP3, setUseP3] = useState(false);
  const [harmonyKeys, setHarmonyKeys] = useState<string[]>([]);
  
  // Fetch Harmony Keys on mount
  useEffect(() => {
    fetch('/harmony.json')
      .then(res => res.json())
      .then(data => {
        if (data && data.color) {
            setHarmonyKeys(Object.keys(data.color));
        }
      })
      .catch(err => console.error('Failed to load harmony.json', err));
  }, []);

  // Generate Export Content
  const exportContent = useMemo(() => {
    if (!palette || !system) return '';

    if (exportTab === 'css') {
      const lightTokens = system.generateTokens(system.generatePalette(selectedName, false, useP3 ? 'p3' : 'srgb').primitives, false);
      const darkTokens = system.generateTokens(system.generatePalette(selectedName, true, useP3 ? 'p3' : 'srgb').primitives, true);

      const prefixPart = cssPrefix ? `${cssPrefix}-` : '';
      let css = `:root {\n`;
      // Convert dot notation to hyphens for CSS: brand.primary -> brand-primary
      Object.entries(lightTokens).forEach(([k, v]) => css += `  --${prefixPart}${k.replace(/\./g, '-')}: ${v};\n`);

      if (palette.state) {
        Object.entries(palette.state).forEach(([k, v]) => css += `  --state-${k}: ${v};\n`);
      }
      css += `}\n\n`;

      css += `[data-theme='dark'] {\n`;
      Object.entries(darkTokens).forEach(([k, v]) => css += `  --${prefixPart}${k.replace(/\./g, '-')}: ${v};\n`);
      css += `}`;

      return css;
    } 
    
    if (exportTab === 'json_light' || exportTab === 'json_dark') {
      // App JSON Format (Separate output for Light/Dark)
      const isDarkExport = exportTab === 'json_dark';
      const tokens = system.generateTokens(system.generatePalette(selectedName, isDarkExport, useP3 ? 'p3' : 'srgb').primitives, isDarkExport);

      const jsonOutput: { color: { name: string; value: string }[] } = {
        color: []
      };

      // Helper to format name: keys like "brand.primary" -> "brand_primary"
      const formatName = (key: string) => key.replace(/\./g, '_').replace(/-/g, '_');

      Object.keys(tokens).forEach(key => {
        jsonOutput.color.push({
          name: formatName(key),
          value: tokens[key]
        });
      });

      return JSON.stringify(jsonOutput, null, 2);
    } 
    
    if (exportTab === 'figma') {
      // Figma Tokens JSON format
      const lightSystem = system.generatePalette(selectedName, false, useP3 ? 'p3' : 'srgb');
      const darkSystem = system.generatePalette(selectedName, true, useP3 ? 'p3' : 'srgb');
      
      const lightFigma = mapToFigma(lightSystem);
      const darkFigma = mapToFigma(darkSystem);

      // Structure:
      // Global (Primitives)
      // Light (Semantics)
      // Dark (Semantics)
      const output = {
          core: lightFigma.core, // Primitives are same
          light: lightFigma.sys,
          dark: darkFigma.sys
      };

      return JSON.stringify(output, null, 2);
    }

    if (exportTab === 'harmony_light' || exportTab === 'harmony_dark') {
        const lightTokens = system.generateTokens(system.generatePalette(selectedName, false, useP3 ? 'p3' : 'srgb').primitives, false);
        const darkTokens = system.generateTokens(system.generatePalette(selectedName, true, useP3 ? 'p3' : 'srgb').primitives, true);
        const mapper = new HarmonyMapper(lightTokens, darkTokens);
        
        const isDark = exportTab === 'harmony_dark';
        
        // Generate values
        const mapped = mapper.generateResource(harmonyKeys, isDark ? 'dark' : 'base');
        
        // Format as OpenHarmony resource array
        const output = {
            color: Object.entries(mapped).map(([key, value]) => ({
                name: key,
                value: value
            }))
        };
        
        return JSON.stringify(output, null, 2);
    } 
    
    return '';
  }, [exportTab, selectedName, system, palette, cssPrefix, harmonyKeys, useP3, isDark]);

  if (!isOpen) return null;

  return createPortal(
    <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.5)', zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }} onClick={onClose}>
        <div style={{
          background: 'var(--sys-bg-container)',
          color: 'var(--sys-text-primary)',
          width: '700px', // Wider for more tabs
          height: '500px',
          borderRadius: '16px',
          padding: '24px',
          display: 'flex',
          gap: '16px',
          flexDirection: 'column'
        }} onClick={e => e.stopPropagation()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0 }}>导出 Token</h2>
            <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'inherit' }}>&times;</button>
          </div>

          <div style={{ 
            display: 'flex', 
            borderBottom: '1px solid var(--sys-border-divider)', 
            alignItems: 'center', 
            gap: '16px' 
          }}>
            <div style={{ 
                display: 'flex', 
                gap: '8px', 
                flex: 1, 
                overflowX: 'auto',
                paddingBottom: '0px',
                // Hide scrollbar but allow scroll
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
            }}>
              <style>{`
                .tab-scroll::-webkit-scrollbar { display: none; }
              `}</style>
              <div className="tab-scroll" style={{ display: 'flex', gap: '8px' }}>
              <button
                style={{
                  padding: '12px 16px',
                  background: 'none',
                  border: 'none',
                  borderBottom: exportTab === 'css' ? '2px solid var(--sys-brand-primary)' : '2px solid transparent',
                  fontWeight: exportTab === 'css' ? 'bold' : 'normal',
                  cursor: 'pointer',
                  color: 'inherit',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s'
                }}
                onClick={() => setExportTab('css')}
              >CSS</button>
              <button
                style={{
                  padding: '12px 16px',
                  background: 'none',
                  border: 'none',
                  borderBottom: exportTab === 'json_light' ? '2px solid var(--sys-brand-primary)' : '2px solid transparent',
                  fontWeight: exportTab === 'json_light' ? 'bold' : 'normal',
                  cursor: 'pointer',
                  color: 'inherit',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s'
                }}
                onClick={() => setExportTab('json_light')}
              >JSON (浅色)</button>
              <button
                style={{
                  padding: '12px 16px',
                  background: 'none',
                  border: 'none',
                  borderBottom: exportTab === 'json_dark' ? '2px solid var(--sys-brand-primary)' : '2px solid transparent',
                  fontWeight: exportTab === 'json_dark' ? 'bold' : 'normal',
                  cursor: 'pointer',
                  color: 'inherit',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s'
                }}
                onClick={() => setExportTab('json_dark')}
              >JSON (深色)</button>
              <button
                style={{
                  padding: '12px 16px',
                  background: 'none',
                  border: 'none',
                  borderBottom: exportTab === 'figma' ? '2px solid var(--sys-brand-primary)' : '2px solid transparent',
                  fontWeight: exportTab === 'figma' ? 'bold' : 'normal',
                  cursor: 'pointer',
                  color: 'inherit',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s'
                }}
                onClick={() => setExportTab('figma')}
              >Figma</button>
               <button
                style={{
                  padding: '12px 16px',
                  background: 'none',
                  border: 'none',
                  borderBottom: exportTab === 'harmony_light' ? '2px solid var(--sys-brand-primary)' : '2px solid transparent',
                  fontWeight: exportTab === 'harmony_light' ? 'bold' : 'normal',
                  cursor: 'pointer',
                  color: 'inherit',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s'
                }}
                onClick={() => setExportTab('harmony_light')}
              >HarmonyOS (浅色)</button>
               <button
                style={{
                  padding: '12px 16px',
                  background: 'none',
                  border: 'none',
                  borderBottom: exportTab === 'harmony_dark' ? '2px solid var(--sys-brand-primary)' : '2px solid transparent',
                  fontWeight: exportTab === 'harmony_dark' ? 'bold' : 'normal',
                  cursor: 'pointer',
                  color: 'inherit',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s'
                }}
                onClick={() => setExportTab('harmony_dark')}
              >HarmonyOS (深色)</button>
              </div>
            </div>
          </div>

          {exportTab === 'css' && (
             <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', padding: '8px 0' }}>
               <span>前缀:</span>
               <input
                 value={cssPrefix}
                 onChange={e => setCssPrefix(e.target.value)}
                 style={{ width: '80px', padding: '6px', borderRadius: '4px', border: '1px solid var(--sys-border-default)' }}
                 placeholder='sys'
               />
             </div>
           )}

          <textarea
            value={exportContent}
            readOnly
            style={{
              flex: 1,
              background: 'var(--sys-bg-elevated)',
              color: 'var(--sys-text-secondary)',
              border: 'none',
              borderRadius: '8px',
              padding: '16px',
              fontFamily: 'monospace',
              resize: 'none',
              marginTop: exportTab === 'css' ? '0' : '16px'
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--sys-border-divider)' }}>
             <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }}>
               <input 
                 type="checkbox" 
                 checked={useP3} 
                 onChange={e => setUseP3(e.target.checked)} 
                 style={{ width: '16px', height: '16px' }}
               />
               <span style={{ fontSize: '14px', fontWeight: 500 }}>启用 P3 广色域</span>
             </label>

            <button className="btn btn-primary" onClick={() => navigator.clipboard.writeText(exportContent)}>
              复制到剪贴板
            </button>
          </div>
        </div>
      </div>,
    document.body
  );
};
