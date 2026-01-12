
import React, { useState, useMemo } from 'react';
import colorData from '../../lib/colors.json';
import { useThemeStore } from '../../store/useThemeStore';
import { ExportModal } from '../ExportModal';
import { useActivePalette } from '../../hooks/useActivePalette';

// --- Interfaces ---

interface ColorItem {
  name: string;
  hex: string;
  pinyin: string;
  description?: string;
  isCustom?: boolean; 
}

// Verified list of distinct beautiful colors
const FEATURED_NAMES = [
  '胭脂', // Rouge (Pinkish Red)
  '朱红', // Vermilion (Bright Red/Orange)
  '藤黄', // Gamboge (Yellow)
  '石绿', // Mineral Green (Green)
  '孔雀绿', // Peacock Green (Teal)
  '天蓝', // Sky Blue (Light Blue)
  '靛蓝', // Indigo (Deep Blue)
  '魏紫'  // Wei Purple (Purple)
];

export const ThemePicker: React.FC = () => {
    // Correctly type the filtered list
    const featuredColors: ColorItem[] = useMemo(() => FEATURED_NAMES.map(name =>
        (colorData as ColorItem[]).find(c => c.name === name)
    ).filter((c): c is ColorItem => !!c), []);

  // Use Global Store
  const { theme, hex, setTheme, setHex } = useThemeStore();
  
  // Use Shared Hook
  const { activeColor, system, palette } = useActivePalette();


  // Derived Selection State (for Display only)
  // We keep this local derivation for UI highlighting logic if needed, 
  // OR we can just use activeColor from hook for consistency.
  // Let's use activeColor from hook to be 100% consistent.
  const selectedColor = activeColor;

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [customHexInput, setCustomHexInput] = useState<string>('');
  
  // Toggle Input Mode
  const [showInput, setShowInput] = useState(false);
  const [showExport, setShowExport] = useState(false);

  const handleHexSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      // Basic validation
      let val = customHexInput.trim();
      if (!val.startsWith('#')) val = '#' + val;
      if (/^#([0-9A-F]{3}){1,2}$/i.test(val)) {
          setHex(val);
          setShowInput(false);
      } else {
          alert('Invalid HEX Code');
      }
  };

  if (featuredColors.length === 0) return null;

  return (
    <div className="theme-picker-inline" style={{ marginTop: '24px', marginBottom: '32px' }}>

      {/* Label + Mode Toggle */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '12px',
        fontSize: '14px',
        color: 'var(--sys-text-secondary)',
        fontWeight: 500
      }}>
        <span>当前主题: <strong style={{ color: 'var(--sys-text-primary)' }}>{selectedColor.name} {selectedColor.isCustom ? `(${selectedColor.hex})` : ''}</strong></span>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
            {/* Custom Hex Trigger */}
            <button 
                onClick={() => setShowInput(!showInput)}
                style={{
                    background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', opacity: 0.7
                }}
                title="Input Custom Hex"
            >
                🎨
            </button>
            
            {/* Export Button */}
            <button
            onClick={() => setShowExport(true)}
            style={{
                background: 'var(--sys-bg-elevated)',
                border: '1px solid var(--sys-border-default)',
                borderRadius: '99px',
                padding: '2px 8px',
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                color: 'var(--sys-text-primary)',
                transition: 'all 0.2s',
            }}
            >
            📤 Export
            </button>
        </div>
      </div>
      
      {/* Custom Input Popover */}
      {showInput && (
          <form onSubmit={handleHexSubmit} style={{ marginBottom: '12px', display: 'flex', gap: '8px' }}>
              <input 
                autoFocus
                type="text" 
                placeholder="#RRGGBB"
                value={customHexInput}
                onChange={e => setCustomHexInput(e.target.value)}
                style={{
                    background: 'var(--sys-bg-elevated)',
                    border: '1px solid var(--sys-border-default)',
                    color: 'var(--sys-text-primary)',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    width: '100px'
                }}
              />
              <button 
                type="submit"
                style={{
                    background: 'var(--sys-brand-primary)',
                    color: 'var(--sys-text-on-brand)',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    cursor: 'pointer',
                    fontSize: '12px'
                }}
            >Apply</button>
          </form>
      )}

      {/* Inline Swatches (Horizon Dock) */}
      <div 
        style={{
            display: 'flex',
            alignItems: 'flex-end',
            height: '64px',
            gap: '12px',
            padding: '0 12px'
        }}
        onMouseLeave={() => setActiveIndex(null)}
      >
        {featuredColors.map((c, index) => {
          // If custom is selected, no bubble is "active" unless we add a custom bubble.
          // For now, if custom is active, these are just alternatives.
          const isSelected = !selectedColor.isCustom && selectedColor.name === c.name;
          
          let scale = 1;
          if (activeIndex !== null) {
              const dist = Math.abs(activeIndex - index);
              if (dist === 0) scale = 1.5;
              else if (dist === 1) scale = 1.25;
              else scale = 1;
          } else {
              scale = isSelected ? 1.15 : 1;
          }

          return (
            <button
              key={c.name}
              onClick={() => setTheme(c.name)}
              onMouseEnter={() => setActiveIndex(index)}
              title={c.name}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: c.hex,
                border: isSelected
                  ? '3px solid var(--sys-bg-canvas)'
                  : '2px solid transparent',
                boxShadow: isSelected
                  ? '0 0 0 2px var(--sys-text-primary), 0 4px 12px rgba(0,0,0,0.1)'
                  : '0 2px 4px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.18, 0.89, 0.32, 1.28)', 
                transform: `scale(${scale}) translateY(${scale > 1 ? -10 : 0}px)`, 
                padding: 0,
                position: 'relative',
                zIndex: scale > 1 ? 10 : 1
              }}
            >
            </button>
          )
        })}
      </div>

        {/* Unified Export Modal */}
        <ExportModal 
            isOpen={showExport} 
            onClose={() => setShowExport(false)} 
            palette={palette as any} 
            system={system} 
            selectedName={selectedColor.name} 
        />
    </div>
  );
};
