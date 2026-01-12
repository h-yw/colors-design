import React, { useMemo } from 'react';
import { useThemeStore } from '../store/useThemeStore';
import { useActivePalette } from '../hooks/useActivePalette';
import { TraditionalColorSystem } from '@moonhou/colors-core';
import { ui, defaultLang } from '../i18n/ui';

export const HarmonyExplorer: React.FC = () => {
    const { setToken } = useThemeStore();
    const { activeColor, palette } = useActivePalette();
    const hex = activeColor.hex;

    const t = ui[defaultLang]; 

    const harmonies = useMemo(() => {
        // We create a temp system instance with just the brand color to calculate harmonies
        const tempSystem = new TraditionalColorSystem([{ 
            name: 'current', 
            hex: hex, 
            pinyin: 'dangqian' 
        }]);
        
        return tempSystem.generateHarmonies('current');
    }, [hex]);

    const HarmonyCard = ({ title, colors }: { title: string, colors: string[] }) => (
        <div style={{
            background: 'var(--sys-bg-elevated)',
            border: '1px solid var(--sys-border-default)',
            borderRadius: '16px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
        }}>
            <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--sys-text-primary)' }}>{title}</h3>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                {colors.map((c, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                        <div style={{
                            width: '80px', height: '80px', borderRadius: '12px',
                            background: c,
                            boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.1)'
                        }} />
                        <span style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--sys-text-secondary)' }}>
                            {c}
                        </span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                             {/* Mini Actions */}
                            <button 
                                onClick={() => setToken('secondary', c)}
                                title={t['harmony.apply_secondary']}
                                style={{
                                    cursor: 'pointer', padding: '4px 8px', fontSize: '10px',
                                    borderRadius: '4px', border: '1px solid var(--sys-border-default)',
                                    background: 'var(--sys-bg-container)', color: 'var(--sys-text-primary)'
                                }}
                            >
                                2
                            </button>
                             <button 
                                onClick={() => setToken('tertiary', c)}
                                title={t['harmony.apply_tertiary']}
                                style={{
                                    cursor: 'pointer', padding: '4px 8px', fontSize: '10px',
                                    borderRadius: '4px', border: '1px solid var(--sys-border-default)',
                                    background: 'var(--sys-bg-container)', color: 'var(--sys-text-primary)'
                                }}
                            >
                                3
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const secondaryColor = palette.primitives.secondary[40];
    const tertiaryColor = palette.primitives.tertiary[40];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
             {/* Brand & Active Status */}
             <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                gap: '24px' 
            }}>
                <div style={{ 
                    padding: '24px', 
                    background: 'var(--sys-brand-primary-container, var(--sys-bg-container))', 
                    border: '1px solid var(--sys-brand-primary)',
                    borderRadius: '16px',
                    color: 'var(--sys-text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                }}>
                    <div style={{ 
                        width: '48px', height: '48px', borderRadius: '50%', 
                        background: hex, 
                        border: '2px solid #fff', 
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)' 
                    }} />
                    <div>
                        <div style={{ fontWeight: 'bold' }}>{t['harmony.based_on']}</div>
                        <div style={{ fontFamily: 'monospace', opacity: 0.8 }}>{hex}</div>
                    </div>
                </div>

                {/* Status Preview */}
                <div style={{ 
                    padding: '24px', 
                    background: 'var(--sys-bg-container)', 
                    border: '1px solid var(--sys-border-default)',
                    borderRadius: '16px',
                    display: 'flex',
                    gap: '24px'
                }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                         <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: secondaryColor }} />
                         <div>
                             <div style={{ fontSize: '12px', color: 'var(--sys-text-secondary)' }}>Active Secondary</div>
                             <div style={{ fontFamily: 'monospace', fontSize: '14px' }}>{secondaryColor}</div>
                         </div>
                    </div>
                    <div style={{ width: '1px', background: 'var(--sys-border-divider)' }} />
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                         <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: tertiaryColor }} />
                         <div>
                             <div style={{ fontSize: '12px', color: 'var(--sys-text-secondary)' }}>Active Tertiary</div>
                             <div style={{ fontFamily: 'monospace', fontSize: '14px' }}>{tertiaryColor}</div>
                         </div>
                    </div>
                </div>
            </div>

            {/* Reset Action */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                    onClick={() => {
                        setToken('secondary', undefined); 
                        setToken('tertiary', undefined);
                    }}
                    style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        border: '1px solid var(--sys-border-default)',
                        background: 'transparent',
                        color: 'var(--sys-text-secondary)',
                        cursor: 'pointer',
                        fontSize: '14px'
                    }}
                >
                    ↺ Reset to Default Harmonies
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                <HarmonyCard 
                    title={t['harmony.complementary']} 
                    colors={[harmonies.complementary]} 
                />
                <HarmonyCard 
                    title={t['harmony.analogous']} 
                    colors={harmonies.analogous} 
                />
                <HarmonyCard 
                    title={t['harmony.triadic']} 
                    colors={harmonies.triadic} 
                />
            </div>
            
            <p style={{ color: 'var(--sys-text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>
                💡 Tip: 点击颜色下方的 "2" 或 "3" 按钮，可将其直接应用为系统的主题色（Secondary / Tertiary），快速验证配色方案。
            </p>
        </div>
    );
};
