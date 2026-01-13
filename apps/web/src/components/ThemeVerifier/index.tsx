import React, { useState } from 'react';
import './style.css';
import colorData from '../../lib/colors.json';
import { PhoneMock } from './mocks/PhoneMock';
import { BlogMock } from './mocks/BlogMock';
import { DashboardMock } from './mocks/DashboardMock';
import { useThemeStore } from '../../store/useThemeStore';
import { useActivePalette } from '../../hooks/useActivePalette';

// Extracted Components
import { PrimitiveCharts } from '../PrimitiveCharts';
import { TokenTable } from '../TokenTable';
import { AccessibilityReport } from '../AccessibilityReport';
import { ExportModal } from '../ExportModal';
import { HarmonyDisplay } from './HarmonyDisplay';

interface ColorItem {
    name: string;
    hex: string;
    pinyin: string;
    description?: string;
    isCustom?: boolean;
}

export const ThemeVerifier: React.FC = () => {
  const { theme, hex, setTheme, setHex } = useThemeStore();
  
  // Use Shared Hook
  const { activeColor, system, palette } = useActivePalette();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showExport, setShowExport] = useState<boolean>(false);
  const [simulationMode, setSimulationMode] = useState<'none' | 'protanopia' | 'deuteranopia' | 'tritanopia'>('none');

  // Search Logic
  const handleSearchChange = (val: string) => {
      setSearchTerm(val);
      const trimmed = val.trim();
      
      const hexRegex = /^#([0-9A-F]{3}){1,2}$/i;
      const hexNoHashRegex = /^[0-9A-F]{6}$/i;
      
      if (hexRegex.test(trimmed)) {
           if (hex?.toLowerCase() !== trimmed.toLowerCase().replace('#', '')) {
               setHex(trimmed);
           }
      } else if (hexNoHashRegex.test(trimmed)) {
           if (hex?.toLowerCase() !== trimmed.toLowerCase()) {
               setHex('#' + trimmed);
           }
      }
  };

  const filteredColors: ColorItem[] = (colorData as ColorItem[]).filter(c =>
    c.name.includes(searchTerm) ||
    c.pinyin.includes(searchTerm) ||
    c.hex.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="app-container">
      {/* SVG Filters for Color Blindness */}
      <svg style={{ height: 0, width: 0, position: 'absolute', pointerEvents: 'none' }}>
        <defs>
          <filter id="protanopia">
            <feColorMatrix type="matrix" values="0.567 0.433 0 0 0  0.558 0.442 0 0 0  0 0.242 0.758 0 0  0 0 0 1 0" />
          </filter>
          <filter id="deuteranopia">
            <feColorMatrix type="matrix" values="0.625 0.375 0 0 0  0.7 0.3 0 0 0  0 0.3 0.7 0 0  0 0 0 1 0" />
          </filter>
          <filter id="tritanopia">
             <feColorMatrix type="matrix" values="0.95 0.05 0 0 0  0 0.433 0.567 0 0  0 0.475 0.525 0 0  0 0 0 1 0" />
          </filter>
        </defs>
      </svg>

      {/* 侧边栏 */}
      <aside className="sidebar">
        <div className="search-box">
          <input
            className="search-input"
            placeholder="搜索色彩或 Hex 值..."
            value={searchTerm}
            onChange={e => handleSearchChange(e.target.value)}
          />
        </div>
        <div className="color-list">
          {filteredColors.slice(0, 80).map(c => (
            <div
              key={c.name}
              className={`color-item ${activeColor.name === c.name ? 'active' : ''}`}
              onClick={() => {
                  setTheme(c.name);
              }}
            >
              <div className="color-swatch" style={{ backgroundColor: c.hex }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', fontSize: '13px' }}>{c.name}</div>
                <div style={{ fontSize: '11px', opacity: 0.7 }}>{c.pinyin}</div>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* 主验证区：设计系统文档模式 */}
      <main className="main-content" style={{ 
          filter: simulationMode !== 'none' ? `url(#${simulationMode})` : 'none',
          transition: 'filter 0.3s'
      }}>

        {/* 1. Hero Section */}
        <div className="docs-hero">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="breadcrumb">
               <span>设计系统</span>
               <span className="separator">/</span>
               <span>Token 变量</span>
               <span className="separator">/</span>
               <span className="current">{palette.meta.name}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 className="docs-title">
                        {palette.meta.name} 设计变量
                    </h1>
                     <p className="docs-description">
                        {palette.meta.name} ({palette.meta.pinyin}) 色彩系统的唯一可信数据源。
                        基于 OKLCH 插值生成，完全符合 APCA 对比度标准。
                    </p>
                </div>
                
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                     {/* Color Blindness Selector */}
                     <select 
                        value={simulationMode}
                        onChange={(e) => setSimulationMode(e.target.value as any)}
                        className="simulation-select"
                     >
                        <option value="none">👁️ 正常视觉</option>
                        <option value="protanopia">🔴 红色盲 (Protanopia)</option>
                        <option value="deuteranopia">🟢 绿色盲 (Deuteranopia)</option>
                        <option value="tritanopia">🔵 蓝色盲 (Tritanopia)</option>
                     </select>

                     <button className="docs-action-btn" onClick={() => setShowExport(true)}>
                        <span>📤</span> 导出配方
                     </button>
                </div>
            </div>
          </div>
        </div>

        <div className="docs-wrapper">

          {/* New Section: Primitive Scales */}
          <PrimitiveCharts primitives={palette.primitives as any} />

          {/* 2. Token Dictionary */}
          <TokenTable tokens={palette.tokens as any} />


          {/* 3. Accessibility Check */}
          <AccessibilityReport palette={palette as any} system={system} />

          {/* 3.5 Harmonies (New Feature) */}
          <section className="docs-section">
              <h2>色彩和声 🎨</h2>
              <HarmonyDisplay system={system} activeColorName={activeColor.name} />
          </section>

          {/* 4. Realism Lab (Mockups) */}
          <section className="docs-section">
            <h2>真机模拟实验室 🧪</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                
                {/* 1. Mobile OS (HarmonyOS Style) */}
                <div className="lab-case">
                    <h3>1. 移动端 OS (HarmonyOS ArkUI)</h3>
                    <p className="lab-case-desc">
                        验证 <code>bg.canvas</code> 与 <code>bg.surface</code> 的分层效果及其在大触控区域下的适配性。
                        展示系统在“分组列表”范式下的表现。
                    </p>
                    <div className="lab-case-preview mobile">
                        <PhoneMock />
                    </div>
                </div>

                {/* 2. Editorial / Blog */}
                <div className="lab-case">
                    <h3>2. 长文阅读 / 内容流</h3>
                     <p className="lab-case-desc">
                        验证沉浸式阅读体验，测试 <code>text.primary</code> 层级和细微 <code>bg.tint</code> 的应用效果。
                    </p>
                    <div className="lab-case-preview">
                        <BlogMock />
                    </div>
                </div>

                {/* 3. SaaS Dashboard */}
                <div className="lab-case">
                    <h3>3. SaaS 后台仪表盘</h3>
                     <p className="lab-case-desc">
                        信息密度压力测试。检查 <code>border.divider</code> 边界可见性和 <code>semantic.*</code> 状态色的区分度。
                    </p>
                    <div className="lab-case-preview">
                        <DashboardMock />
                    </div>
                </div>

            </div>
          </section>

        </div>
      </main>
      
      {/* Export Modal */}
      <ExportModal 
        isOpen={showExport} 
        onClose={() => setShowExport(false)} 
      />
    </div>
  );
};