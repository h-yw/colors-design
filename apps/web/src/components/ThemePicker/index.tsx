
import React, { useState, useMemo } from 'react';
import './style.css';
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
    <div className="theme-picker-inline">

      {/* Label + Mode Toggle */}
      <div className="theme-picker-header">
        <span>当前主题: <strong className="theme-picker-current-value">{selectedColor.name} {selectedColor.isCustom ? `(${selectedColor.hex})` : ''}</strong></span>

        <div className="theme-picker-controls">
            {/* Custom Hex Trigger */}
            <button 
                onClick={() => setShowInput(!showInput)}
                className="theme-picker-custom-btn"
                title="Input Custom Hex"
            >
                🎨
            </button>
            
            {/* Export Button */}
            <button
            onClick={() => setShowExport(true)}
            className="theme-picker-export-btn"
            >
            📤 Export
            </button>
        </div>
      </div>
      
      {/* Custom Input Popover */}
      {showInput && (
          <form onSubmit={handleHexSubmit} className="theme-picker-custom-form">
              <input 
                autoFocus
                type="text" 
                placeholder="#RRGGBB"
                value={customHexInput}
                onChange={e => setCustomHexInput(e.target.value)}
                className="theme-picker-custom-input"
              />
              <button 
                type="submit"
                className="theme-picker-apply-btn"
            >Apply</button>
          </form>
      )}

      {/* Inline Swatches (Horizon Dock) */}
      <div 
        className="theme-picker-dock"
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
              className={`theme-picker-swatch ${isSelected ? 'active' : 'inactive'}`}
              style={{
                background: c.hex,
                transform: `scale(${scale}) translateY(${scale > 1 ? -10 : 0}px)`, 
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
        />
    </div>
  );
};
