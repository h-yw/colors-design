import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import './style.css';
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
    <div className="export-modal-overlay" onClick={onClose}>
        <div className="export-modal-content" onClick={e => e.stopPropagation()}>
          <div className="export-modal-header">
            <h2>导出 Token</h2>
            <button onClick={onClose} className="export-modal-close-btn">&times;</button>
          </div>

          <div className="export-modal-tabs-container">
            <div className="export-modal-scroll-wrapper">
              <div className="export-modal-tabs-list">
                <button
                  className={`export-modal-tab-btn ${exportTab === 'css' ? 'active' : ''}`}
                  onClick={() => setExportTab('css')}
                >CSS</button>
                <button
                  className={`export-modal-tab-btn ${exportTab === 'json_light' ? 'active' : ''}`}
                  onClick={() => setExportTab('json_light')}
                >JSON (浅色)</button>
                <button
                  className={`export-modal-tab-btn ${exportTab === 'json_dark' ? 'active' : ''}`}
                  onClick={() => setExportTab('json_dark')}
                >JSON (深色)</button>
                <button
                  className={`export-modal-tab-btn ${exportTab === 'figma' ? 'active' : ''}`}
                  onClick={() => setExportTab('figma')}
                >Figma</button>
                 <button
                  className={`export-modal-tab-btn ${exportTab === 'harmony_light' ? 'active' : ''}`}
                  onClick={() => setExportTab('harmony_light')}
                >HarmonyOS (浅色)</button>
                 <button
                  className={`export-modal-tab-btn ${exportTab === 'harmony_dark' ? 'active' : ''}`}
                  onClick={() => setExportTab('harmony_dark')}
                >HarmonyOS (深色)</button>
              </div>
            </div>
          </div>

          {exportTab === 'css' && (
             <div className="export-modal-prefix-row">
               <span>前缀:</span>
               <input
                 value={cssPrefix}
                 onChange={e => setCssPrefix(e.target.value)}
                 className="export-modal-prefix-input"
                 placeholder='sys'
               />
             </div>
           )}

          <textarea
            value={exportContent}
            readOnly
            className={`export-modal-textarea ${exportTab !== 'css' ? 'no-margin' : ''}`}
          />

          <div className="export-modal-footer">
             <label className="export-modal-p3-label">
               <input 
                 type="checkbox" 
                 checked={useP3} 
                 onChange={e => setUseP3(e.target.checked)} 
                 className="export-modal-p3-checkbox"
               />
               <span className="export-modal-p3-text">启用 P3 广色域</span>
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
